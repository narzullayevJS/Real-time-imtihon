import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column("simple-array")
  options: string[];

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => User, user => user.id)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
