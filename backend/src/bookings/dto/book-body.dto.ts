import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsObject, IsString, Max, MaxLength, Min, ValidateNested } from "class-validator";

export class BookBodyDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    room_id!: number

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    full_name!: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    phone_number!: string

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Max(9999)
    duration!: number


    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddonItemsDto)
    addons!: AddonItemsDto[]
}

class AddonItemsDto {
    @IsInt()
    @Min(1)
    id!: number;

    @IsInt()
    @Min(1)
    count!: number;
}