import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string!' })
  @IsNotEmpty({ message: 'Username should not be empty if provided!' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string!' })
  @IsNotEmpty({ message: 'Password should not be empty if provided!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  // Uncomment this if you want to enforce password complexity
  // @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}/, {
  //   message: 'Password must include uppercase, lowercase, a number, and a special character!',
  // })
  password?: string;
}
