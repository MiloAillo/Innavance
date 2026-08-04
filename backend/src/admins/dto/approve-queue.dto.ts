import { Type } from "class-transformer";
import { IsNotEmpty, IsInt } from "class-validator";

export class approveQueueDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    booking_id!: number
}