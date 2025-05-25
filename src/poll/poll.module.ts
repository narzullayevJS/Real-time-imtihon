import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from 'src/entities/Poll.entity';
import { User } from 'src/entities/User.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, User])],
  controllers: [PollController],
  providers: [PollService, RedisService],
})
export class PollModule {}
