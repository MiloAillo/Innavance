import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DetailParam {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  id!: number;
}
