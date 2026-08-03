import { Transform, Type } from 'class-transformer'
import { IsOptional, IsInt, Min, Max, IsEnum, IsArray, IsString } from 'class-validator'

export enum OrderBy {
  title = 'title',
  createdAt = 'createdAt'
}

export enum Order {
  asc = 'asc',
  desc = 'desc'
}

export enum TypeFilter {
    info = 'info',
    important = 'important',
    warning = 'warning'
}

export class NotificationQueryDto {
  @IsOptional()
  @Type(() => Number)       // cast data type to number
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)       // cast data type to number
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @IsOptional()
  @IsEnum(OrderBy)
  order_by?: OrderBy = OrderBy.createdAt

  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.desc

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
        return value.split(',').map((item) => item.trim())
    }
  })
  @IsArray()
  @IsEnum(TypeFilter, { each: true })
  filter_type?: TypeFilter[] = [TypeFilter.important, TypeFilter.info, TypeFilter.warning]
}