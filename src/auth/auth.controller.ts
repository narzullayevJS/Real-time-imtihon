import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/entities/User.entity';
import { GqlAuthGuard } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(GqlAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user);
  }
}
