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
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addonIds?: number[];
}
