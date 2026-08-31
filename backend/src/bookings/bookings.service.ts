import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BookBodyDto } from './dto/book-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateAccountId } from '../helper/generate-account-id';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { generateRoomPin } from '../helper/generate-room-pin';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue } from 'bullmq';
import maskData from 'maskdata';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('booking-queue') private readonly bookingQueue: Queue,
  ) {}

  async detail(bookingId: number) {
    // grab the booking detail that the user specified
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      select: {
        room_id: true,
        name: true,
        phoneNumber: true,
        duration: true,
        price: true,
        paymentMethod: true,
        isAutoApprove: true,
        status: true,
        autoApproveTime: true,
        createdAt: true,
        bookingRoom: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!booking)
      throw new NotFoundException(
        "booking data with id specified doesn't exist",
      );

    return {
      room_id: booking.room_id,
      name: maskData.maskStringV2(booking.name, {
        unmaskedStartCharacters: 1,
        unmaskedEndCharacters: 2,
      }),
      phone_number: maskData.maskPhone(booking.phoneNumber, {
        unmaskedStartDigits: 3,
        unmaskedEndDigits: 3,
      }),
      status: booking.status,
      duration: booking.duration,
      price: maskData.maskStringV2(booking.price.toString()),
      payment_method: booking.paymentMethod,
      room_name: booking.bookingRoom.name,
      is_auto_approve: booking.isAutoApprove,
      auto_approve_time: booking.autoApproveTime,
      created_at: booking.createdAt,
    };
  }

  async book(bookBodyDto: BookBodyDto) {
    // variable for future uses
    let price = 0;
    const paymentMethod = bookBodyDto.payment_method;

    // 1. CHECKING THE USER REQUEST
    const room = await this.prisma.rooms.findUnique({
      where: { id: bookBodyDto.room_id },
      include: {
        roomsAddons: {
          include: {
            addon: true,
          },
        },
      },
    });

    if (!room)
      throw new NotFoundException('No room specified by room_id found');

    if (!room.isAvailable)
      throw new UnauthorizedException('Room is already reserved');

    const roomAddons = {};
    room.roomsAddons.forEach((object) => {
      roomAddons[object.addon.id] = object.addon;
    });

    const roomAddonsId = room.roomsAddons.map((object) => object.addon.id);

    const responseAddons: {}[] = [];

    bookBodyDto.addons.forEach((addon) => {
      if (!roomAddonsId.includes(addon.id))
        throw new UnauthorizedException(`addon_id ${addon.id} isn't available`);

      if (addon.count > roomAddons[addon.id].borrowMaximum)
        throw new UnauthorizedException(
          `addon_id ${addon.id} exceed maximum borrow allowed`,
        );

      price += roomAddons[addon.id].price * addon.count;

      responseAddons.push({
        addon_name: roomAddons[addon.id].name,
        count: addon.count,
        price: roomAddons[addon.id].price * addon.count,
      });
    });

    price += room.price * bookBodyDto.duration;

    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
      select: {
        isAutoApprove: true,
        autoApproveTime: true,
      },
    });

    const waitForApproval =
      adminSettings?.isAutoApprove === true
        ? adminSettings.autoApproveTime === 0
          ? false
          : true
        : true;

    // 2. CREATE THE BOOKING WITH TRANSACTION (INCLUDES WHATSAPP SEND)
    const addonsToCreate = bookBodyDto.addons.map((addon) => ({
      addon_id: addon.id,
      count: addon.count,
    }));

    const booking = await this.prisma.$transaction(async (tx) => {
      const [createdBooking] = await Promise.all([
        tx.bookings.create({
          data: {
            room_id: room.id,
            status: waitForApproval ? 'on_hold' : 'checked_in',
            name: bookBodyDto.full_name,
            phoneNumber: bookBodyDto.phone_number,
            duration: bookBodyDto.duration,
            price: price,
            isAutoApprove: adminSettings?.isAutoApprove,
            autoApproveTime: adminSettings?.autoApproveTime,
            paymentMethod: paymentMethod,
            isAddonServed: bookBodyDto.addons.length === 0 ? true : false,
            isInnkeeperCalled: false,

            bookingsAddons: {
              createMany: {
                data: addonsToCreate,
              },
            },
          },
        }),
        tx.rooms.update({
          where: { id: room.id },
          data: { isAvailable: false },
        }),
      ]);

      if (!waitForApproval) {
        await this.checkedInWithTransaction(
          tx,
          room.name,
          room.id,
          bookBodyDto.phone_number,
          createdBooking.id,
          bookBodyDto.duration,
          price,
          paymentMethod,
        );
      } else {
        await this.onHoldWithWhatsApp(
          room.name,
          bookBodyDto.phone_number,
          adminSettings?.isAutoApprove ?? false,
          adminSettings?.autoApproveTime ?? 10,
          room.id,
          createdBooking.id,
          bookBodyDto.duration,
          price,
          paymentMethod,
        );
      }

      return createdBooking;
    });

    return {
      booking_id: booking.id,
      room_name: room.name,
      duration: bookBodyDto.duration,
      price: price,
      addons: responseAddons,
      wait_for_approval: waitForApproval,
    };
  }

  async checkout(bookingId: number, accountId: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: bookingId,
        status: 'checked_in',
        bookingRoom: {
          accountId: accountId,
        },
      },
      include: {
        bookingRoom: true,
      },
    });
    if (!booking) throw new NotFoundException('no active booking found');

    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    const isNoGraceTime =
      adminSettings.checkOutGracePeriod === 0 ? true : false;

    await this.prisma.$transaction(async (tx) => {
      if (isNoGraceTime) {
        await this.checkedOutWithTransaction(
          tx,
          booking.bookingRoom.name,
          booking.bookingRoom.id,
          booking.id,
          booking.phoneNumber,
          adminSettings.smartDoorDefaultPin,
        );
      } else {
        await this.checkingOutWithTransaction(
          tx,
          booking.bookingRoom.name,
          booking.bookingRoom.id,
          booking.id,
          booking.phoneNumber,
          adminSettings.checkOutGracePeriod,
        );
      }
    });

    return {
      status: isNoGraceTime ? 'checked_out' : 'checking_out',
      grace_period: adminSettings.checkOutGracePeriod,
    };
  }

  // modular function used by another function to make booking automatically switch to checked in based on autoApprove state and time
  async onHoldWithWhatsApp(
    room_name: string,
    phone_number: string,
    isAutoApprove: boolean,
    autoApproveTime: number,
    room_id: number,
    booking_id: number,
    duration: number,
    price: number,
    payment_method: string,
  ) {
    if (isAutoApprove) {
      this.bookingQueue.add(
        'auto-checkin',
        {
          room_name,
          room_id,
          phone_number,
          booking_id,
        },
        {
          delay: autoApproveTime * 60 * 1000,
        },
      );
    }

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `Thank you for reserving a room at Innavance!\nYour reservation request is currently being reviewed by us.\n\n📋 *Booking Summary:*\n- Room: ${room_name}\n- Duration: ${duration} day(s)\n- Total Price: ${formattedPrice}\n- Payment: ${payment_method}\n\nOnce reviewed, we will notify you about our decision here.\n\n🔍 *Track Your Status:*\n${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/status/${booking_id}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  async checkedInWithTransaction(
    tx: any,
    room_name: string,
    room_id: number,
    phone_number: string,
    booking_id: number,
    duration: number,
    price: number,
    payment_method: string,
  ) {
    const accountId = generateAccountId();
    const smartDoorPin = generateRoomPin();

    await tx.bookings.update({
      where: { id: booking_id },
      data: {
        status: 'checked_in',
        checkedInAt: new Date(),
      },
    });

    await tx.rooms.update({
      where: { id: room_id },
      data: {
        accountId: accountId,
        smartDoorPin: smartDoorPin,
      },
    });

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `Thank you for reserving a room at Innavance!\nYour reservation for ${room_name} has been approved! 🎉\n\n📋 *Booking Summary:*\n- Room: ${room_name}\n- Duration: ${duration} day(s)\n- Total Price: ${formattedPrice}\n- Payment: ${payment_method}\n\n🔑 *Access Details:*\n- Door PIN: ${smartDoorPin}\n- Account ID: ${accountId}\n\n🌐 *Dashboard Access:*\n${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login/user\n\nDon't forget to access your room dashboard for checking out, calling the innkeeper, and monitoring your room!\n\nHave any question? Don't be shy to call our innkeeper through the dashboard!`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  async onHold(
    room_name: string,
    phone_number: string,
    isAutoApprove: boolean,
    autoApproveTime: number,
    room_id: number,
    booking_id: number,
  ) {
    if (isAutoApprove) {
      this.bookingQueue.add(
        'auto-checkin',
        {
          room_name,
          room_id,
          phone_number,
          booking_id,
        },
        {
          delay: autoApproveTime * 60 * 1000,
        },
      );
    }

    // Fetch booking data to get duration, price, payment_method
    const booking = await this.prisma.bookings.findUnique({
      where: { id: booking_id },
      select: {
        duration: true,
        price: true,
        paymentMethod: true,
      },
    });

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(booking?.price ?? 0);

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `Thank you for reserving a room at Innavance!\nYour reservation request is currently being reviewed by us.\n\n📋 *Booking Summary:*\n- Room: ${room_name}\n- Duration: ${booking?.duration ?? 0} day(s)\n- Total Price: ${formattedPrice}\n- Payment: ${booking?.paymentMethod ?? 'N/A'}\n\nOnce reviewed, we will notify you about our decision here.\n\n🔍 *Track Your Status:*\n${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/status/${booking_id}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  // modular function used by another function to update the room state to checked in from being on hold in approval queue
  async checkedIn(
    room_name: string,
    room_id: number,
    phone_number: string,
    booking_id: number,
  ) {
    const accountId = generateAccountId();
    const smartDoorPin = generateRoomPin();

    await this.prisma.bookings.update({
      where: { id: booking_id },
      data: {
        status: 'checked_in',
        checkedInAt: new Date(),
      },
    });

    await this.prisma.rooms.update({
      where: { id: room_id },
      data: {
        accountId: accountId,
        smartDoorPin: smartDoorPin,
      },
    });

    // Fetch booking data to get duration, price, payment_method
    const booking = await this.prisma.bookings.findUnique({
      where: { id: booking_id },
      select: {
        duration: true,
        price: true,
        paymentMethod: true,
      },
    });

    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(booking?.price ?? 0);

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `Thank you for reserving a room at Innavance!\nYour reservation for ${room_name} has been approved! 🎉\n\n📋 *Booking Summary:*\n- Room: ${room_name}\n- Duration: ${booking?.duration ?? 0} day(s)\n- Total Price: ${formattedPrice}\n- Payment: ${booking?.paymentMethod ?? 'N/A'}\n\n🔑 *Access Details:*\n- Door PIN: ${smartDoorPin}\n- Account ID: ${accountId}\n\n🌐 *Dashboard Access:*\n${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login/user\n\nDon't forget to access your room dashboard for checking out, calling the innkeeper, and monitoring your room!\n\nHave any question? Don't be shy to call our innkeeper through the dashboard!`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  // modular function used by another function to update the room state to checking out
  async checkingOutWithTransaction(
    tx: any,
    room_name: string,
    room_id: number,
    booking_id: number,
    phone_number: string,
    checkOutGracePeriod: number,
  ) {
    await tx.bookings.update({
      where: { id: booking_id },
      data: {
        status: 'checking_out',
        checkoutGraceTime: checkOutGracePeriod,
      },
    });

    this.bookingQueue.add(
      'auto_checkout',
      {
        room_name,
        room_id,
        booking_id,
        phone_number,
      },
      {
        delay: checkOutGracePeriod * 60 * 1000,
      },
    );

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `It looks like you checked out from ${room_name} at Innavance.\nWe give you ${checkOutGracePeriod} minutes to pack your belongings and kiss our room goodbye.\n\nPlease leave the room before the grace period ends, as the door PIN will become unusable.`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  async checkedOutWithTransaction(
    tx: any,
    room_name: string,
    room_id: number,
    booking_id: number,
    phone_number: string,
    smartDoorDefaultPin: string,
  ) {
    await tx.rooms.update({
      where: { id: room_id },
      data: {
        smartDoorPin: smartDoorDefaultPin,
        accountId: null,
        isAvailable: true,
      },
    });

    await tx.bookings.update({
      where: { id: booking_id },
      data: { 
        status: 'checked_out',
        checkedOutAt: new Date(),
      },
    });

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `You have checked out from ${room_name} at Innavance.\nThe door PIN and Dashboard is now unusable.\n\nThank you for choosing us, we always welcome you and are excited to see you again! 😉\n`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  async checkingOut(
    room_name: string,
    room_id: number,
    booking_id: number,
    phone_number: string,
  ) {
    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    await this.prisma.bookings.update({
      where: { id: booking_id },
      data: {
        status: 'checking_out',
        checkoutGraceTime: adminSettings.checkOutGracePeriod,
      },
    });

    this.bookingQueue.add(
      'auto_checkout',
      {
        room_name,
        room_id,
        booking_id,
        phone_number,
      },
      {
        delay: adminSettings.checkOutGracePeriod * 60 * 1000,
      },
    );

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `It looks like you checked out from ${room_name} at Innavance.\nWe give you ${adminSettings.checkOutGracePeriod} minutes to pack your belongings and kiss our room goodbye.\n\nPlease leave the room before the grace period ends, as the door PIN will become unusable.`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
  }

  async checkedOut(
    room_name: string,
    room_id: number,
    booking_id: number,
    phone_number: string,
  ) {
    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    await this.prisma.rooms.update({
      where: { id: room_id },
      data: {
        smartDoorPin: adminSettings.smartDoorDefaultPin,
        accountId: null,
        isAvailable: true,
      },
    });

    await this.prisma.bookings.update({
      where: { id: booking_id },
      data: { 
        status: 'checked_out',
        checkedOutAt: new Date(),
      },
    });

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `You have checked out from ${room_name} at Innavance.\nThe door PIN and Dashboard is now unusable.\n\nThank you for choosing us, we always welcome you and are excited to see you again! 😉\n`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
  }
}
