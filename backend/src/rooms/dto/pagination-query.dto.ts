import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderBy {
  name = 'name',
  price = 'price',
  capacity = 'capacity',
}

export enum Order {
  asc = 'asc',
  desc = 'desc',
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number) // cast data type to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number) // cast data type to number
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(OrderBy)
  order_by?: OrderBy = OrderBy.name;

  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.desc;
}
