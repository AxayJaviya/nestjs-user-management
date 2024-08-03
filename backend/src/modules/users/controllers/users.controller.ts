import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../guards/auth.guard';
import { UpdateUserProfileDto } from '../dtos/updateUserProfile.dto';
import { UserWithoutPassword } from '../interfaces/users.repository';
import { UsersService } from '../services/users.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/whoami')
  getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.getUserById(userId);
  }

  @Patch('/profile')
  updateProfile(
    @Request() req,
    @Body() userProfile: UpdateUserProfileDto,
  ): Promise<UserWithoutPassword> {
    const userId = req.user.id;
    return this.usersService.updateUserById(userId, userProfile);
  }
}
