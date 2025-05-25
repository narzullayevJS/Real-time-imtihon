import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/User.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: 'your_jwt_secret',
        expiresIn: '1d',
      }),
      user: this.toUserResponseDto(user),
    };
  }

  async getProfile(userPayload: User) {
    const user = await this.usersRepository.findOne({
      where: { id: userPayload.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user: this.toUserResponseDto(user) };
  }

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const newUser = this.usersRepository.create({
      ...registerDto,
    });

    const savedUser = await this.usersRepository.save(newUser);
    return this.toUserResponseDto(savedUser);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    const { password, ...userData } = user;
    return userData;
  }
}
