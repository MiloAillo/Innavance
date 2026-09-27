import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
