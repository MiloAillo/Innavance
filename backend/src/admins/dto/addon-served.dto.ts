import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt } from 'class-validator';

export class AddonServedDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  booking_id!: number;
}
