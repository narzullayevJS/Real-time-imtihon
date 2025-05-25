import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Poll } from './Poll.entity';
import { Vote } from './Vote.entity';

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @ApiProperty({ default: 'Shahriyor' })
  name: string;

  @Column({ nullable: false, unique: true })
  @ApiProperty({ default: 'shahriyor@gmail.com' })
  email: string;

  @Column({ nullable: false, select: false })
  @ApiProperty({ default: 'Admin_123' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: 'UserRoles',
    default: UserRoles.USER,
  })
  @ApiProperty({ default: UserRoles.USER })
  role: UserRoles;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Poll, (poll) => poll.created_by)
  pollsCreated: Poll[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
