import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthService, TokenResponse } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<TokenResponse> {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto): Promise<TokenResponse> {
    return this.authService.signIn(signInDto);
  }
}
