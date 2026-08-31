import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  // username criteria
  @IsNotEmpty({ message: 'username is missing.' })
  @IsString()
  @Length(3, 50, {
    message: 'username must be at least 3 characters and exceed 50 characters.',
  })
  username!: string;

  // password criteria
  @IsNotEmpty({ message: 'username is missing.' })
  @IsString()
  @Length(3, 50, {
    message: 'username must be at least 3 characters and exceed 50 characters.',
  })
  password!: string;
}
