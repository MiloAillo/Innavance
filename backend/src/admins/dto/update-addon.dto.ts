import { IsOptional, IsString, IsInt, Min, MaxLength, IsBoolean } from 'class-validator';

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  addon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  borrowMaximum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalStock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
