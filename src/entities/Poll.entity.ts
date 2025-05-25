import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Vote } from './Vote.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Column()
  @ApiProperty({ example: 'What is your favorite programming language?' })
  question: string;

  @Column('simple-array')
  @ApiProperty({
    example: ['JavaScript', 'TypeScript', 'Python'],
    type: [String],
  })
  options: string[];

  @Column({ default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.pollsCreated, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @OneToMany(() => Vote, (vote) => vote.poll)
  votes: Vote[];

  @CreateDateColumn()
  @ApiProperty({ example: '2023-05-25T12:00:00.000Z' })
  createdAt: Date;
}
