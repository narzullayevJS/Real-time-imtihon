import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { UserRolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/User.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin/polls')
@ApiBearerAuth()
@UseGuards(GqlAuthGuard, UserRolesGuard)
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  @Roles('admin')
  async createPoll(
    @Body() createPollDto: CreatePollDto,
    @CurrentUser() user: User,
  ) {
    return this.pollService.createPoll(createPollDto, user);
  }

  @Get('active')
  @Roles('admin')
  async getActivePools() {
    return this.pollService.getActivePolls();
  }

  @Get(':id/results')
  @Roles('admin')
  async getResults(@Param('id') id: string) {
    return this.pollService.getResults(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  async deactivatePoll(@Param('id') id: string) {
    return this.pollService.deactivatePoll(id);
  }

  @Delete(':id')
  @Roles('admin')
  async deletePoll(@Param('id') id: string) {
    return this.pollService.deletePoll(id);
  }
}
