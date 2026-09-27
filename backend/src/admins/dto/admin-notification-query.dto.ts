import { IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminNotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['info', 'warning', 'important'])
  type?: 'info' | 'warning' | 'important';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unread_only?: boolean = false;
}
