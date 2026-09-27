import { IsNotEmpty, IsString, IsInt, Min, MaxLength, IsOptional, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(225)
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  capacity: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addonIds?: number[];
}
