import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum BookingStatus {
    on_hold = 'on_hold',
    rejected = 'rejected',
    checked_in = 'checked_in',
    checking_out = 'checking_out',
    checked_out = 'checked_out',
}

export enum Order {
    asc = 'asc',
    desc = 'desc'
}

export enum BookingOrderBy {
    id = 'id',
    status = 'status',
    name = 'name',
    phoneNumber = 'phoneNumber',
    duration = 'duration',
    price = 'price',
    paymentMethod = 'paymentMethod',
    isAddonServed = 'isAddonServed',
    isInnkeeperCalled = 'isInnkeeperCalled',
    isAutoApprove = 'isAutoApprove',
    checkoutGraceTime = 'checkoutGraceTime',
    autoApproveTime = 'autoApproveTime',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    room_name = 'room_name',
}

export class BookingQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            return value.split(',').map((item) => item.trim())
        }
        return value
    })
    @IsArray()
    @IsEnum(BookingStatus, { each: true })
    filter_booking_status: BookingStatus[] = [BookingStatus.checked_in, BookingStatus.checked_out, BookingStatus.checking_out, BookingStatus.on_hold, BookingStatus.rejected]

    @IsOptional()
    @IsString()
    booking_name?: string = undefined

    @IsOptional()
    @IsString()
    booking_phone_number?: string = undefined

    @IsOptional()
    @IsString()
    room_name?: string = undefined

    @IsOptional()
    @IsString()
    payment_method?: string = undefined

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    include_room: boolean = true

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    filter_call: boolean | undefined = undefined

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    filter_addon_served: boolean | undefined = undefined

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    filter_auto_approve: boolean | undefined = undefined

    @IsOptional()
    @IsString()
    @IsEnum(Order)
    order: Order = Order.desc

    @IsOptional()
    @IsString()
    @IsEnum(BookingOrderBy)
    order_by: BookingOrderBy = BookingOrderBy.createdAt
}