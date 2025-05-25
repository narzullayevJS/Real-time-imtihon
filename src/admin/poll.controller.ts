import { Controller, Post, Get, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { PollService } from './poll.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Poll Admin') 
@Controller('admin/polls')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi so‘rovnoma yaratish' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        createdById: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Poll yaratildi' })
  async createPoll(
    @Body('question') question: string,
    @Body('options') options: string[],
    @Body('createdById') createdById: string,
  ) {
    return this.pollService.createPoll(question, options, createdById);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Poll natijalarini olish' })
  @ApiResponse({ status: 200, description: 'Poll natijalari qaytarildi' })
  @ApiResponse({ status: 404, description: 'Poll topilmadi' })
  async getPollResults(@Param('id') id: string) {
    const poll = await this.pollService.getPollResults(id);
    if (!poll) throw new NotFoundException('Poll not found');
    return poll;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Pollni faol holatdan chiqarish' })
  @ApiResponse({ status: 200, description: 'Poll faol emas holatga o‘tkazildi' })
  async deactivatePoll(@Param('id') id: string) {
    return this.pollService.deactivatePoll(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Pollni o‘chirish' })
  @ApiResponse({ status: 200, description: 'Poll o‘chirildi' })
  async deletePoll(@Param('id') id: string) {
    await this.pollService.deletePoll(id);
    return { message: 'Poll deleted successfully' };
  }
}
