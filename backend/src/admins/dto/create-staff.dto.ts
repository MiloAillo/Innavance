import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  password: string;
}
