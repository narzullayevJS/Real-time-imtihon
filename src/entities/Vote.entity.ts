import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { Poll } from './Poll.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.id)
  userId: User;

  @ManyToOne(() => Poll, poll => poll.id)
  pollId: Poll;

  @Column()
  selectedOption: string;

  @CreateDateColumn()
  createdAt: Date;
}
