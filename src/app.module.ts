import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/User.entity';
import { Poll } from './entities/Poll.entity';
import { Vote } from './entities/Vote.entity';
import { AuthModule } from './auth/auth.module';
import { PollService } from './admin/poll.service';
import { PollController } from './admin/poll.controller';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1235',
      database: 'real_time',
      entities: [User, Poll, Vote],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Poll, Vote]),
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController, PollController],
  providers: [AppService, PollService],
})
export class AppModule {}
