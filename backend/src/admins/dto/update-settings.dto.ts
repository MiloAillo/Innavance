import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  @IsOptional()
  is_auto_approve: boolean;

  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  auto_approve_time: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  checkout_grace_period: number;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  @IsOptional()
  smart_door_default_pin: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qr_instructions: string[];
}
