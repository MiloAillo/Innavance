import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum AdminUsersType {
    manager = 'manager',
    staff = 'staff'
}

export enum Order {
    asc = 'asc',
    desc = 'desc'
}

export enum AdminUsersOrderBy {
    id = 'id',
    admin_id = 'admin_id',
    type = 'type',
    name = 'name',
    username = 'username',
    createdAt = 'createdAt',
}

export class AdminUsersQueryDto {
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
    @IsEnum(AdminUsersType, { each: true })
    filter_type: AdminUsersType[] = [AdminUsersType.manager, AdminUsersType.staff]

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    filter_admin_id?: number = undefined

    @IsOptional()
    @IsString()
    name?: string = undefined

    @IsOptional()
    @IsString()
    username?: string = undefined

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    include_admin: boolean = false

    @IsOptional()
    @IsString()
    @IsEnum(Order)
    order: Order = Order.desc

    @IsOptional()
    @IsString()
    @IsEnum(AdminUsersOrderBy)
    order_by: AdminUsersOrderBy = AdminUsersOrderBy.createdAt
}