import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RefreshDto {
  @IsNotEmpty({ message: 'refresh_token is missing.' })
  @IsString()
  refresh_token!: string;
}
