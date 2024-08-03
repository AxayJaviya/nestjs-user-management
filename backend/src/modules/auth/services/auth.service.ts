import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';

export interface TokenResponse {
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<TokenResponse> {
    const passwordHash = await this.hashPassword(signUpDto.password);
    const createdUser = await this.usersService.createUser({
      ...signUpDto,
      password: passwordHash,
    });

    return this.generateTokenResponse(createdUser);
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponse> {
    const registeredUser = await this.usersService.getFullUserByUserName(
      signInDto.username,
    );

    if (
      !registeredUser ||
      !(await this.comparePassword(signInDto.password, registeredUser.password))
    ) {
      throw new UnauthorizedException('Incorrect username or password!');
    }

    return this.generateTokenResponse(registeredUser);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private createPayload(user: { id: number; username: string }): {
    id: number;
    username: string;
  } {
    return {
      id: user.id,
      username: user.username,
    };
  }

  private generateTokenResponse(user: {
    id: number;
    username: string;
  }): TokenResponse {
    const payload = this.createPayload(user);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
    return { token };
  }
}
