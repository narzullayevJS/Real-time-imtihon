import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { UserRoles } from '../../entities/User.entity';

export class RegisterDto {
  @ApiProperty({ example: 'Shahriyor', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'shahriyor@gmail.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (6-20 chars)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    enum: UserRoles,
    enumName: 'UserRoles',
    example: UserRoles.USER,
    description: 'User role',
    default: UserRoles.USER,
  })
  @IsEnum(UserRoles)
  role: UserRoles = UserRoles.USER;
}
