import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './User.entity';
import { Poll } from './Poll.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['user', 'poll'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ManyToOne(() => User, (user) => user.votes)
  @ApiProperty({ type: () => User })
  user: User;

  @ManyToOne(() => Poll, (poll) => poll.votes)
  @ApiProperty({ type: () => Poll })
  poll: Poll;

  @Column()
  @ApiProperty({ example: 'TypeScript' })
  selectedOption: string;

  @CreateDateColumn()
  @ApiProperty({ example: '2023-05-25T12:00:00.000Z' })
  createdAt: Date;
}
