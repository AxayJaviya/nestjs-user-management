import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString({ message: 'Username must be a string!' })
  @IsNotEmpty({ message: 'Username is required!' })
  username: string;

  @IsString({ message: 'Password must be a string!' })
  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  // Uncomment this if you want to enforce password complexity
  // @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}/, {
  //   message: 'Password must include uppercase, lowercase, a number, and a special character!',
  // })
  password: string;
}
