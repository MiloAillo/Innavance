import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Order, OrderBy, PaginationQueryDto } from './dto/pagination-query.dto';
import { DetailParam } from './dto/detail-param.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(paginationQuery: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      order_by = OrderBy.name,
      order = Order.desc,
    } = paginationQuery;

    // build a pagination system
    const skip = (page - 1) * limit; // calculate how many to skip

    // dynamic variable for ordering rooms data
    const dataOrder = { [order_by]: order };

    // run data fetching and total count query in parallel for performance
    const [data, total] = await Promise.all([
      this.prisma.rooms.findMany({
        skip,
        take: limit,
        orderBy: dataOrder,
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          description: true,
          isAvailable: true,
        },
      }),
      this.prisma.rooms.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        order,
        order_by,
        has_page_before: page !== 1,
        has_page_after: skip + limit < total,
        page_end: Math.ceil(total / limit),
      },
    };
  }

  async detail(param: DetailParam) {
    const { id } = param;

    // grab the rooms with all its addons and features
    const data = await this.prisma.rooms.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        price: true,
        capacity: true,
        description: true,
        isAvailable: true,
        features: {
          select: {
            feature: true,
          },
        },
        roomsAddons: {
          select: {
            addon: true,
          },
        },
      },
    });

    if (!data) throw new NotFoundException('No rooms found');

    // prisma always throws nested array with object
    // when the schema involve relations
    // this return here will invlove cleaning the data
    return {
      ...data, // spread operator to spread all the data inside this object
      features: data.features.map((object) => object.feature), // replace features with actual array filled with feature
      roomsAddons: undefined, // omit the roomsAddons pivot table
      addons: data.roomsAddons.map((object) => object.addon), // create new addons array
    };
  }

  async qrCode(param: DetailParam) {
    const { id } = param;

    const [room, adminSettings] = await Promise.all([
      this.prisma.rooms.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          features: {
            select: {
              feature: true,
            },
          },
        },
      }),
      this.prisma.admin.findUnique({
        where: { id: 1 },
        select: {
          qrInstructions: true,
        },
      }),
    ]);

    if (!room) throw new NotFoundException('No room found');

    return {
      id: room.id,
      name: room.name,
      price: room.price,
      capacity: room.capacity,
      features: room.features.map((object) => object.feature),
      qr_instructions: adminSettings?.qrInstructions || [],
    };
  }
}
