import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/User.entity';
import { Poll } from './entities/Poll.entity';
import { Vote } from './entities/Vote.entity';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { PollModule } from './poll/poll.module';

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
    PollModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
