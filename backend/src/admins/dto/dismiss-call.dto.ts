import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DismissCallDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  booking_id!: number;

  @IsOptional()
  @IsString()
  message: string | undefined = undefined;
}
