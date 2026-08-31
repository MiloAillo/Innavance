import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithJWTPayload } from '../guard/jwt-auth-guard.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AdminUsersOrderBy,
  AdminUsersQueryDto,
  AdminUsersType,
  Order as AdminUsersOrder,
} from '../dto/admin-users-query.dto';
import {
  BookingQueryDto,
  BookingOrderBy,
  BookingStatus as BookingQueryStatus,
  Order as BookingQueryOrder,
} from '../dto/booking-query.dto';
import {
  BookingStatus,
  Order,
  OrderBy,
  RoomIsAvailable,
  RoomQueryDto,
} from '../dto/room-query.dto';
import { DismissCallDto } from '../dto/dismiss-call.dto';
import { ForceCheckoutDto } from '../dto/force-checkout.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import axios from 'axios';
import { AddonServedDto } from '../dto/addon-served.dto';
import { generateAccountId } from 'src/helper/generate-account-id';
import { generateRoomPin } from 'src/helper/generate-room-pin';
import { approveQueueDto } from '../dto/approve-queue.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UpdateStaffPermissionsDto } from '../dto/update-staff-permissions.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('admin-booking-queue') private readonly bookingQueue: Queue,
  ) {}

  async getUserInfo(request: RequestWithJWTPayload) {
    // grab the user data from db according to the parsed token specified
    const user = await this.prisma.adminUsers.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        username: true,
      },
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }

  async getRooms(roomQueryDto: RoomQueryDto) {
    const {
      filter_available_room = RoomIsAvailable.both,
      include_booking = false,
      filter_booking_status = [
        BookingStatus.checked_in,
        BookingStatus.checked_out,
        BookingStatus.checking_out,
        BookingStatus.on_hold,
        BookingStatus.rejected,
      ],
      room_name = undefined,
      filter_call = undefined,
      filter_addon_served = undefined,
      order = Order.desc,
      order_by = OrderBy.name,
      page = 1,
      limit = 10,
    } = roomQueryDto;

    // build the dynamic filtering and sorting
    const skip = (page - 1) * limit;

    const isAvailableORM =
      filter_available_room !== 'both'
        ? { isAvailable: filter_available_room === 'true' }
        : undefined;

    const whereBookingsConstraintORM =
      typeof filter_call !== 'undefined' ||
      typeof filter_addon_served !== 'undefined'
        ? {
            some: {
              isInnkeeperCalled: filter_call,
              isAddonServed: filter_addon_served,
            },
          }
        : undefined;

    // grab the room requested
    const [rooms, roomsCount] = await Promise.all([
      this.prisma.rooms.findMany({
        where: {
          ...isAvailableORM,
          name: {
            contains: room_name,
          },
          bookings: whereBookingsConstraintORM,
        },
        include: include_booking
          ? {
              bookings: {
                where: {
                  status: {
                    in: ['checked_in', 'checking_out'],
                  },
                  isInnkeeperCalled: filter_call,
                  isAddonServed: filter_addon_served,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            }
          : undefined,
        orderBy: {
          [order_by]: order,
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.rooms.count({
        where: {
          ...isAvailableORM,
          name: {
            contains: room_name,
          },
          bookings: whereBookingsConstraintORM,
        },
      }),
    ]);

    // grab the admin settings to allow frontend render different stuff
    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    return {
      data: rooms,
      meta: {
        is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
        is_staff_allowed_to_dismiss_call:
          adminSettings.isStaffAllowedToDismissCall,
        is_staff_allowed_to_force_checkout:
          adminSettings.isStaffAllowedToForceCheckout,
        total: roomsCount,
        page,
        order,
        order_by,
        has_page_before: page !== 1,
        has_page_after: skip + limit < roomsCount,
        page_end: Math.ceil(roomsCount / limit),
      },
    };

    /// add the pagination info to meta
  }

  async getBookings(bookingQueryDto: BookingQueryDto) {
    const {
      filter_booking_status = [
        BookingQueryStatus.checked_in,
        BookingQueryStatus.checked_out,
        BookingQueryStatus.checking_out,
        BookingQueryStatus.on_hold,
        BookingQueryStatus.rejected,
      ],
      booking_name = undefined,
      booking_phone_number = undefined,
      room_name = undefined,
      payment_method = undefined,
      include_room = true,
      filter_call = undefined,
      filter_addon_served = undefined,
      filter_auto_approve = undefined,
      filter_attention = undefined,
      order = BookingQueryOrder.desc,
      order_by = BookingOrderBy.createdAt,
      page = 1,
      limit = 10,
    } = bookingQueryDto;

    const skip = (page - 1) * limit;

    const whereORM = {
      status: {
        in: filter_booking_status,
      },
      ...(typeof booking_name !== 'undefined'
        ? {
            name: {
              contains: booking_name,
            },
          }
        : {}),
      ...(typeof booking_phone_number !== 'undefined'
        ? {
            phoneNumber: {
              contains: booking_phone_number,
            },
          }
        : {}),
      ...(typeof payment_method !== 'undefined'
        ? {
            paymentMethod: {
              contains: payment_method,
            },
          }
        : {}),
      ...(typeof filter_call !== 'undefined'
        ? {
            isInnkeeperCalled: filter_call,
          }
        : {}),
      ...(typeof filter_addon_served !== 'undefined'
        ? {
            isAddonServed: filter_addon_served,
          }
        : {}),
      ...(typeof filter_auto_approve !== 'undefined'
        ? {
            isAutoApprove: filter_auto_approve,
          }
        : {}),
      ...(typeof room_name !== 'undefined'
        ? {
            bookingRoom: {
              name: {
                contains: room_name,
              },
            },
          }
        : {}),
      ...(filter_attention
        ? {
            OR: [{ isInnkeeperCalled: true }, { isAddonServed: false }],
          }
        : {}),
    };

    const orderByORM =
      order_by === BookingOrderBy.room_name
        ? {
            bookingRoom: {
              name: order,
            },
          }
        : {
            [order_by]: order,
          };

    const includeORM = {
      include: {
        ...(include_room
          ? {
              bookingRoom: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  capacity: true,
                  isAvailable: true,
                },
              },
            }
          : {}),
        bookingsAddons: {
          include: {
            addonAddon: {
              select: { addon: true },
            },
          },
        },
      },
    };

    const [bookings, bookingsCount] = await Promise.all([
      this.prisma.bookings.findMany({
        where: whereORM,
        ...includeORM,
        orderBy: orderByORM,
        skip: skip,
        take: limit,
      }),
      this.prisma.bookings.count({
        where: whereORM,
      }),
    ]);

    return {
      data: bookings,
      meta: {
        total: bookingsCount,
        page,
        order,
        order_by,
        has_page_before: page !== 1,
        has_page_after: skip + limit < bookingsCount,
        page_end: Math.ceil(bookingsCount / limit),
      },
    };
  }

  async getAdminUsers(adminUsersQueryDto: AdminUsersQueryDto) {
    const {
      filter_type = [AdminUsersType.manager, AdminUsersType.staff],
      filter_admin_id = undefined,
      name = undefined,
      username = undefined,
      include_admin = false,
      order = AdminUsersOrder.desc,
      order_by = AdminUsersOrderBy.createdAt,
      page = 1,
      limit = 10,
    } = adminUsersQueryDto;

    const skip = (page - 1) * limit;

    const whereORM = {
      type: {
        in: filter_type,
      },
      ...(typeof filter_admin_id !== 'undefined'
        ? {
            admin_id: filter_admin_id,
          }
        : {}),
      ...(typeof name !== 'undefined'
        ? {
            name: {
              contains: name,
            },
          }
        : {}),
      ...(typeof username !== 'undefined'
        ? {
            username: {
              contains: username,
            },
          }
        : {}),
    };

    const includeORM = include_admin
      ? {
          include: {
            userAdmin: {
              select: {
                id: true,
                isAutoApprove: true,
                autoApproveTime: true,
                checkOutGracePeriod: true,
                isStaffAllowedToApprove: true,
                isStaffAllowedToForceCheckout: true,
                isStaffAllowedToDismissCall: true,
              },
            },
          },
        }
      : undefined;

    const [users, usersCount] = await Promise.all([
      this.prisma.adminUsers.findMany({
        where: whereORM,
        ...includeORM,
        select: include_admin
          ? undefined
          : {
              id: true,
              admin_id: true,
              type: true,
              name: true,
              username: true,
              createdAt: true,
            },
        orderBy: {
          [order_by]: order,
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.adminUsers.count({
        where: whereORM,
      }),
    ]);

    return {
      data: users,
      meta: {
        page,
        order,
        order_by,
        has_page_before: page !== 1,
        has_page_after: skip + limit < usersCount,
        page_end: Math.ceil(usersCount / limit),
      },
    };
  }

  async getSettings(request: RequestWithJWTPayload) {
    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    return {
      is_auto_approve: adminSettings.isAutoApprove,
      auto_approve_time: adminSettings.autoApproveTime,
      smart_door_default_pin: adminSettings.smartDoorDefaultPin,
      checkout_grace_period: adminSettings.checkOutGracePeriod,
      is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
      is_staff_allowed_to_force_checkout:
        adminSettings.isStaffAllowedToForceCheckout,
      is_staff_allowed_to_dissmiss_call:
        adminSettings.isStaffAllowedToDismissCall,
      qr_instructions: adminSettings.qrInstructions,
    };
  }

  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
    request: RequestWithJWTPayload,
  ) {
    // only manager can update the booking settings
    if (request.user.type !== 'manager') throw new ForbiddenException();

    // update the global booking settings
    const adminSettings = await this.prisma.admin.update({
      where: { id: 1 },
      data: {
        ...(typeof updateSettingsDto.is_auto_approve !== 'undefined'
          ? { isAutoApprove: updateSettingsDto.is_auto_approve }
          : {}),
        ...(typeof updateSettingsDto.auto_approve_time !== 'undefined'
          ? { autoApproveTime: updateSettingsDto.auto_approve_time }
          : {}),
        ...(typeof updateSettingsDto.checkout_grace_period !== 'undefined'
          ? { checkOutGracePeriod: updateSettingsDto.checkout_grace_period }
          : {}),
        ...(typeof updateSettingsDto.smart_door_default_pin !== 'undefined'
          ? { smartDoorDefaultPin: updateSettingsDto.smart_door_default_pin }
          : {}),
        ...(typeof updateSettingsDto.qr_instructions !== 'undefined'
          ? { qrInstructions: updateSettingsDto.qr_instructions }
          : {}),
      },
    });

    return {
      is_auto_approve: adminSettings.isAutoApprove,
      auto_approve_time: adminSettings.autoApproveTime,
      smart_door_default_pin: adminSettings.smartDoorDefaultPin,
      checkout_grace_period: adminSettings.checkOutGracePeriod,
      is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
      is_staff_allowed_to_force_checkout:
        adminSettings.isStaffAllowedToForceCheckout,
      is_staff_allowed_to_dissmiss_call:
        adminSettings.isStaffAllowedToDismissCall,
      qr_instructions: adminSettings.qrInstructions,
    };
  }

  async updateStaffPermissions(
    updateStaffPermissionsDto: UpdateStaffPermissionsDto,
    request: RequestWithJWTPayload,
  ) {
    if (request.user.type !== 'manager') throw new ForbiddenException();

    const adminSettings = await this.prisma.admin.update({
      where: { id: 1 },
      data: {
        ...(typeof updateStaffPermissionsDto.is_staff_allowed_to_approve !==
        'undefined'
          ? {
              isStaffAllowedToApprove:
                updateStaffPermissionsDto.is_staff_allowed_to_approve,
            }
          : {}),
        ...(typeof updateStaffPermissionsDto.is_staff_allowed_to_force_checkout !==
        'undefined'
          ? {
              isStaffAllowedToForceCheckout:
                updateStaffPermissionsDto.is_staff_allowed_to_force_checkout,
            }
          : {}),
        ...(typeof updateStaffPermissionsDto.is_staff_allowed_to_dissmiss_call !==
        'undefined'
          ? {
              isStaffAllowedToDismissCall:
                updateStaffPermissionsDto.is_staff_allowed_to_dissmiss_call,
            }
          : {}),
      },
    });

    return {
      is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
      is_staff_allowed_to_force_checkout:
        adminSettings.isStaffAllowedToForceCheckout,
      is_staff_allowed_to_dissmiss_call:
        adminSettings.isStaffAllowedToDismissCall,
    };
  }

  async dismissCall(
    dismissCallDto: DismissCallDto,
    request: RequestWithJWTPayload,
  ) {
    if (request.user.type === 'staff') {
      const adminSettings = await this.prisma.admin.findUnique({
        where: { id: 1 },
      });
      if (!adminSettings) throw new InternalServerErrorException();
      if (!adminSettings.isStaffAllowedToDismissCall)
        throw new ForbiddenException();
    }

    // grab the booking specified by user
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: dismissCallDto.booking_id,
        isInnkeeperCalled: true,
      },
    });
    if (!booking) throw new NotFoundException();

    // grab the admin users that turned off the call
    const admin = await this.prisma.adminUsers.findUnique({
      where: { id: request.user.id },
    });
    if (!admin) throw new UnauthorizedException();

    // turn off the call
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: { isInnkeeperCalled: false },
    });

    // make a web notifications
    await this.prisma.bookingsNotifications.create({
      data: {
        booking_id: booking.id,
        title: `${admin.name} has Served to Your Room`,
        description:
          dismissCallDto.message ??
          "Thank you for calling and trusting our staff, don't be shy to call again.",
        type: 'info',
      },
    });
  }

  async addonServed(
    addonServedDto: AddonServedDto,
    request: RequestWithJWTPayload,
  ) {
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: addonServedDto.booking_id,
        isAddonServed: false,
        status: 'checked_in',
      },
      include: {
        bookingsAddons: {
          include: {
            addonAddon: true,
          },
        },
      },
    });
    if (!booking) throw new NotFoundException();

    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: { isAddonServed: true },
    });

    // Create notification for user
    const addonsList = booking.bookingsAddons
      .map((ba) => `${ba.addonAddon.addon} x${ba.count}`)
      .join(', ');

    await this.prisma.bookingsNotifications.create({
      data: {
        booking_id: booking.id,
        type: 'info',
        title: 'Addons Delivered',
        description: `Your addons have been served: ${addonsList}`,
      },
    });
  }

  async forceCheckout(
    forceCheckoutDto: ForceCheckoutDto,
    request: RequestWithJWTPayload,
  ) {
    if (request.user.type === 'staff') {
      const adminSettings = await this.prisma.admin.findUnique({
        where: { id: 1 },
      });
      if (!adminSettings) throw new InternalServerErrorException();
      if (!adminSettings.isStaffAllowedToForceCheckout)
        throw new ForbiddenException();
    }

    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: forceCheckoutDto.booking_id,
        status: 'checked_in',
      },
      include: {
        bookingRoom: true,
      },
    });
    if (!booking) throw new NotFoundException();

    const adminSettings = await this.prisma.admin.findUnique({
      where: { id: 1 },
    });
    if (!adminSettings) throw new InternalServerErrorException();

    // create web notification
    await this.prisma.bookingsNotifications.create({
      data: {
        booking_id: booking.id,
        type: 'warning',
        title: 'Uh Oh... You Need to Leave',
        description: 'Our staff has forced you to checkout from the room.',
      },
    });

    // if allow grace period and the grace period isn't 0 minutes
    if (
      forceCheckoutDto.allow_grace_period &&
      adminSettings.checkOutGracePeriod !== 0
    ) {
      // update the booking to checking out
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: {
          status: 'checking_out',
          checkoutGraceTime: adminSettings.checkOutGracePeriod,
        },
      });

      // add to queue to trigger automatic check out after grace period expired
      this.bookingQueue.add(
        'force_auto_checkout',
        {
          room_name: booking.bookingRoom.name,
          room_id: booking.bookingRoom.id,
          booking_id: booking.id,
          phone_number: booking.phoneNumber,
        },
        {
          delay: adminSettings.checkOutGracePeriod * 60 * 1000,
        },
      );

      // notify the client
      await axios.post(
        `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
        {
          phone_number: booking.phoneNumber,
          message: `Uh oh, our staff has forced you to checkout from ${booking.bookingRoom.name} at Innavance.\nWe are granting you extra ${adminSettings.checkOutGracePeriod} minutes to pack your belongings and kiss our room goodbye.\n\nPlease leave the room before the grace period ends, as the door PIN will become unusable.\n\nReason:\n${forceCheckoutDto.message}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    } else {
      // grab the admin settings
      const adminSettings = await this.prisma.admin.findUnique({
        where: { id: 1 },
      });
      if (!adminSettings) throw new InternalServerErrorException();

      // update the booking to checked out
      await this.prisma.bookings.update({
        where: { id: booking.id },
        data: { 
          status: 'checked_out',
          checkedOutAt: new Date(),
        },
      });

      // rotate the door PIN to the default value and remove the accountId
      await this.prisma.rooms.update({
        where: { id: booking.bookingRoom.id },
        data: {
          smartDoorPin: adminSettings.smartDoorDefaultPin,
          accountId: null,
          isAvailable: true,
        },
      });

      // notify the client
      await axios.post(
        `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
        {
          phone_number: booking.phoneNumber,
          message: `You has been forced to checked out from ${booking.bookingRoom.name} at Innavance.\nThe door PIN and Dashboard is now unusable.\nWe are aware of our decision and we are very sorry for it to be this way. 😉\n`,
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

  async rejectQueue(
    approveQueueDto: approveQueueDto,
    request: RequestWithJWTPayload,
  ) {
    if (request.user.type === 'staff') {
      const adminSettings = await this.prisma.admin.findUnique({
        where: { id: 1 },
      });
      if (!adminSettings) throw new InternalServerErrorException();
      if (!adminSettings.isStaffAllowedToApprove)
        throw new UnauthorizedException();
    }

    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: approveQueueDto.booking_id,
        status: 'on_hold',
      },
      include: {
        bookingRoom: true,
      },
    });
    if (!booking) throw new NotFoundException();

    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: { status: 'rejected' },
    });

    await this.prisma.rooms.update({
      where: { id: booking.room_id },
      data: { isAvailable: true },
    });

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: booking.phoneNumber,
        message: `We regret to inform you that your reservation request for ${booking.bookingRoom.name} at Innavance has been rejected.\nIf you believe this is a mistake, please contact our staff.\n\nThank you for your understanding.`,
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

  async createStaff(
    createStaffDto: CreateStaffDto,
    request: RequestWithJWTPayload,
  ) {
    if (request.user.type !== 'manager') throw new ForbiddenException();

    const [manager, existingStaff] = await Promise.all([
      this.prisma.adminUsers.findUnique({
        where: { id: request.user.id },
        select: { admin_id: true },
      }),
      this.prisma.adminUsers.findUnique({
        where: { username: createStaffDto.username },
      }),
    ]);
    if (!manager) throw new UnauthorizedException();
    if (existingStaff) throw new ConflictException('Username already exists');

    const password = await bcrypt.hash(createStaffDto.password, 7);
    return await this.prisma.adminUsers.create({
      data: {
        admin_id: manager.admin_id,
        type: 'staff',
        name: createStaffDto.name,
        username: createStaffDto.username,
        password,
      },
      select: {
        id: true,
        admin_id: true,
        type: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });
  }

  async deleteStaff(id: number, request: RequestWithJWTPayload) {
    if (request.user.type !== 'manager') throw new ForbiddenException();

    const [manager, staff] = await Promise.all([
      this.prisma.adminUsers.findUnique({
        where: { id: request.user.id },
        select: { admin_id: true },
      }),
      this.prisma.adminUsers.findUnique({
        where: { id },
        select: { id: true, admin_id: true, type: true },
      }),
    ]);
    if (!manager) throw new UnauthorizedException();
    if (!staff) throw new NotFoundException();
    if (staff.admin_id !== manager.admin_id || staff.type !== 'staff')
      throw new ForbiddenException('Only staff accounts can be deleted');

    await this.prisma.adminUsers.delete({ where: { id } });
    return { message: 'Staff deleted' };
  }

  async approveQueue(
    approveQueueDto: approveQueueDto,
    request: RequestWithJWTPayload,
  ) {
    // check if staff
    if (request.user.type === 'staff') {
      const adminSettings = await this.prisma.admin.findUnique({
        where: { id: 1 },
      });
      if (!adminSettings) throw new InternalServerErrorException();

      // throw forbidden if its not allowed in settings
      if (!adminSettings.isStaffAllowedToApprove)
        throw new ForbiddenException();
    }

    const accountId = generateAccountId();
    const smartDoorPin = generateRoomPin();

    // check if booking exist
    const booking = await this.prisma.bookings.findUnique({
      where: {
        id: approveQueueDto.booking_id,
        status: 'on_hold',
      },
      include: {
        bookingRoom: true,
      },
    });
    if (!booking) throw new NotFoundException();

    // change whose on_hold in that room to checked in
    await this.prisma.bookings.update({
      where: { id: booking.id },
      data: {
        status: 'checked_in',
        checkedInAt: new Date(),
      },
    });

    // update the room accountId and door pin
    await this.prisma.rooms.update({
      where: { id: booking.room_id },
      data: {
        accountId: accountId,
        smartDoorPin: smartDoorPin,
      },
    });

    // send the accountId and door PIN to the client
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(booking.price);

    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: booking.phoneNumber,
        message: `Thank you for reserving a room at Innavance!\nYour reservation for ${booking.bookingRoom.name} has been approved! 🎉\n\n📋 *Booking Summary:*\n- Room: ${booking.bookingRoom.name}\n- Duration: ${booking.duration} day(s)\n- Total Price: ${formattedPrice}\n- Payment: ${booking.paymentMethod}\n\n🔑 *Access Details:*\n- Door PIN: ${smartDoorPin}\n- Account ID: ${accountId}\n\n🌐 *Dashboard Access:*\n${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login/user\n\nDon't forget to access your room dashboard for checking out, calling the innkeeper, and monitoring your room!\n\nHave any question? Don't be shy to call our innkeeper through the dashboard!`,
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
