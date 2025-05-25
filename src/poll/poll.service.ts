import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePollDto } from './dto/create-poll.dto';
import { RedisService } from '../redis/redis.service';
import { Poll } from 'src/entities/Poll.entity';
import { User } from 'src/entities/User.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    private redisService: RedisService,
  ) {}

  async createPoll(createPollDto: CreatePollDto, user: User): Promise<Poll> {
    const poll = this.pollRepository.create({
      ...createPollDto,
      created_by: user,
      isActive: true,
    });

    const savedPoll = await this.pollRepository.save(poll);

    await Promise.all(
      createPollDto.options.map((option) =>
        this.redisService.set(`poll:${savedPoll.id}:${option}`, '0'),
      ),
    );

    return savedPoll;
  }

  async getActivePolls() {
    const polls = await this.pollRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['votes', 'created_by'],
    });

    return polls;
  }

  async getResults(id: string) {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['votes', 'created_by'],
    });

    if (!poll) throw new NotFoundException('Poll not found');

    const results = {};
    for (const option of poll.options) {
      results[option] = parseInt(
        (await this.redisService.get(`poll:${id}:${option}`)) || '0',
      );
    }

    return {
      ...poll,
      results,
    };
  }

  async deactivatePoll(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findOneBy({ id });
    if (!poll) throw new NotFoundException('Poll not found');

    poll.isActive = false;
    return this.pollRepository.save(poll);
  }

  async deletePoll(id: string) {
    const result = await this.pollRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Poll not found');
    }

    const keys = await this.redisService.keys(`poll:${id}:*`);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }

    return {
      message: 'Poll deleted successfully',
    };
  }
}
