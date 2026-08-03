import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "./prisma/prisma.service";
import { randomInt } from "crypto";
import { booleanRandomizer } from "./helper/weighted-boolean-randomizer";
import { floatRandomizer } from "./helper/weighted-float-randomizer";

@Injectable()
export class MetricsService {
    constructor (private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    async update() {
        const [occupiedRoomsId, nonOccupiedRoomsId] = await Promise.all([
            this.prisma.rooms.findMany({
                where: { 
                    bookings: {
                        some: {
                            status: "checked_in"
                        }
                    }
                },
                select: { 
                    id: true,
                    bookings: {
                        select: {
                            id: true
                        }
                    }
                }
            }),
            this.prisma.rooms.findMany({
                where: { 
                    bookings: {
                        none: {
                            status: "checked_in"
                        }
                    }
                },
                select: { 
                    id: true,
                    bookings: {
                        select: {
                            id: true
                        }
                    }
                }
            })
        ])

        await this.prisma.$transaction(
            occupiedRoomsId.map((room) => {
                const isSmartDoorLocked = booleanRandomizer({ true: 95, false: 5 })
                const smartDoorIsOpened = isSmartDoorLocked ? false : booleanRandomizer({ true: 50, false: 50 })
                const electricityOutput = floatRandomizer([ { range: [8, 10], weight: 85 }, { range: [11, 13], weight: 15 } ])
                const isWaterFlowing = booleanRandomizer({ true: 10, false: 90 })
                const waterOutput = isWaterFlowing ? floatRandomizer([ { range: [6, 8], weight: 85 }, { range: [9, 11], weight: 15 } ]) : 0

                return this.prisma.rooms.update({
                    where: { id: room.id },
                    data: {
                        smartDoorIsLocked: isSmartDoorLocked,
                        smartDoorIsOpened: smartDoorIsOpened,
                        electricityOutput: electricityOutput,
                        waterOutput: waterOutput
                    }
                })
            }))

        await this.prisma.$transaction(
            nonOccupiedRoomsId.map((room) => {
                const isSmartDoorLocked = booleanRandomizer({ true: 99, false: 1 })
                const smartDoorIsOpened = isSmartDoorLocked ? false : booleanRandomizer({ true: 100, false: 0 })
                const electricityOutput = floatRandomizer([ { range: [0.1, 0.3], weight: 80 }, { range: [0.4, 0.5], weight: 20 } ])
                const isWaterFlowing = booleanRandomizer({ true: 0, false: 100 })
                const waterOutput = isWaterFlowing ? floatRandomizer([ { range: [6, 8], weight: 85 }, { range: [9, 11], weight: 15 } ]) : 0

                return this.prisma.rooms.update({
                    where: { id: room.id },
                    data: {
                        smartDoorIsLocked: isSmartDoorLocked,
                        smartDoorIsOpened: smartDoorIsOpened,
                        electricityOutput: electricityOutput,
                        waterOutput: waterOutput
                    }
                })
            }))
    }
}