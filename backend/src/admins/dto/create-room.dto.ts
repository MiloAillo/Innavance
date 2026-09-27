import { IsNotEmpty, IsString, IsInt, Min, MaxLength } from 'class-validator';

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
}
