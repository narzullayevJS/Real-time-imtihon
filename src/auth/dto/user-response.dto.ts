import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from 'src/entities/User.entity';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Shahriyor' })
  name: string;

  @ApiProperty({ example: 'shahriyor@example.com' })
  email: string;

  @ApiProperty({ enum: UserRoles, example: UserRoles.USER })
  role: UserRoles;

  @ApiProperty()
  createdAt: Date;
}
