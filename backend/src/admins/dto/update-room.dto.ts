import { IsOptional, IsString, IsInt, Min, MaxLength, IsArray } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addonIds?: number[];
}
