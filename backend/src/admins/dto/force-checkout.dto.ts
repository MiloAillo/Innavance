import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsString } from "class-validator";

export class ForceCheckoutDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    booking_id!: number

    @IsNotEmpty()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    allow_grace_period!: boolean

    @IsNotEmpty()
    @IsString()
    message!: string
}