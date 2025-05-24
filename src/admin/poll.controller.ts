import { Controller, Post, Get, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { PollService } from './poll.service';

@Controller('admin/polls')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  async createPoll(
    @Body('question') question: string,
    @Body('options') options: string[],
    @Body('createdById') createdById: string,
  ) {
    const poll = await this.pollService.createPoll(question, options, createdById);
    return poll;
  }

  @Get(':id/results')
  async getPollResults(@Param('id') id: string) {
    const poll = await this.pollService.getPollResults(id);
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  @Patch(':id')
  async deactivatePoll(@Param('id') id: string) {
    const poll = await this.pollService.deactivatePoll(id);
    return poll;
  }

  @Delete(':id')
  async deletePoll(@Param('id') id: string) {
    await this.pollService.deletePoll(id);
    return { message: 'Poll deleted successfully' };
  }
}
