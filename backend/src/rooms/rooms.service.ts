import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Order, OrderBy, PaginationQueryDto } from './dto/pagination-query.dto';
import { DetailParam } from './dto/detail-param.dto';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) {}

    async overview(paginationQuery: PaginationQueryDto) {
        const { page = 1, limit = 10, order_by = OrderBy.name, order = Order.desc } = paginationQuery

        // build a pagination system
        const skip = (page - 1) * limit    // calculate how many to skip

        // dynamic variable for ordering rooms data
        const dataOrder = { [order_by]: order }

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
                capacity: true
            }
        }),
        this.prisma.rooms.count()
        ])

        return {
            data,
            meta: {
                total,
                page,
                order,
                order_by,
                hasPageBefore: page !== 1,
                hasPageAfter: skip + limit < total 
            }
        }
    }

    async detail(param: DetailParam) {
        const { id } = param

        // parallel db request for performance
        const [ data, checkInCount ] = await Promise.all([
            // grab the rooms with all its addons and features
            this.prisma.rooms.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    capacity: true,
                    description: true,
                    features: {
                        select: {
                            feature: true
                        }
                    },
                    roomsAddons: {
                        select: {
                            addon: true
                        }
                    },
                },
            }),
            // count how many person is in an approval queue or checked in (should be 0 or 1)
            this.prisma.bookings.count({
                where: {
                    room_id: id,
                    status: {
                        in: ["on_hold", "checked_in", "checking_out"]
                    }
                }
            })
        ])

        if (!data) throw new NotFoundException("No rooms found")
        
        // prisma always throws nested array with object
        // when the schema involve relations
        // this return here will invlove cleaning the data
        return {
            checkInAllowed: checkInCount === 0,                             // if no one checking in, then its value will be true 
            ...data,                                                        // spread operator to spread all the data inside this object
            features: data.features.map((object) => object.feature),        // replace features with actual array filled with feature
            roomsAddons: undefined,                                         // omit the roomsAddons pivot table
            addons: data.roomsAddons.map((object) => object.addon),         // create new addons array
        }

    }
}
