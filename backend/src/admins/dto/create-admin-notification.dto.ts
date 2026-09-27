import { IsEnum, IsString, MaxLength } from 'class-validator';

export class CreateAdminNotificationDto {
  @IsEnum(['info', 'warning', 'important'])
  type: 'info' | 'warning' | 'important';

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(500)
  description: string;
}
