import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../entities/Poll.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
  ) {}

  async createPoll(question: string, options: string[], createdById: string): Promise<Poll> {
    const poll = this.pollRepository.create({
      question,
      options,
      isActive: true,
      createdBy: { id: createdById } as any,
    });
    return this.pollRepository.save(poll);
  }

  async getPollResults(id: string): Promise<any> {
    const poll = await this.pollRepository.findOne({ where: { id }, relations: ['createdBy'] });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    // Results calculation will be handled elsewhere (e.g., Redis or Vote repository)
    return poll;
  }

  async deactivatePoll(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({ where: { id } });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    poll.isActive = false;
    return this.pollRepository.save(poll);
  }

  async deletePoll(id: string): Promise<void> {
    await this.pollRepository.delete(id);
  }
}
