import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { TokenService } from './token.service';

export interface Tokens {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const passwordHash = await this.hashPassword(signUpDto.password);
    const createdUser = await this.usersService.createUser({
      ...signUpDto,
      password: passwordHash,
    });

    return this.generateTokenResponse(createdUser);
  }

  async signIn(signInDto: SignInDto): Promise<Tokens> {
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

  async logout(token: Tokens['accessToken']): Promise<void> {
    return this.tokenService.invalidateToken(token);
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
  }): Tokens {
    const payload = this.createPayload(user);
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
