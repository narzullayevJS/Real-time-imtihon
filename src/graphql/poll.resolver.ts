import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../entities/Poll.entity';
import { Vote } from '../entities/Vote.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/User.entity';
import { EventEmitter } from 'events';

const pubSub = new EventEmitter();

@Resolver(() => Poll)
export class PollResolver {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  @Query(() => [Poll])
  async polls(): Promise<Poll[]> {
    return this.pollRepository.find({ where: { isActive: true } });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async vote(
    @Args('pollId') pollId: string,
    @Args('option') option: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId, isActive: true } });
    if (!poll) {
      throw new Error('Poll not found or inactive');
    }

    const existingVote = await this.voteRepository.findOne({ where: { pollId: { id: pollId }, userId: { id: user.id } } });
    if (existingVote) {
      throw new Error('User has already voted in this poll');
    }

    if (!poll.options.includes(option)) {
      throw new Error('Invalid option selected');
    }

    const vote = this.voteRepository.create({
      pollId: poll,
      userId: user,
      selectedOption: option,
    });
    await this.voteRepository.save(vote);

    // Publish updated results
    const votes = await this.voteRepository.find({ where: { pollId: { id: pollId } } });
    const results = poll.options.reduce((acc, opt) => {
      acc[opt] = votes.filter(v => v.selectedOption === opt).length;
      return acc;
    }, {});
    pubSub.emit('pollResults', { pollResults: { pollId, results } });

    return true;
  }

  @Subscription(() => Object, {
    filter: (payload, variables) => payload.pollResults.pollId === variables.pollId,
    resolve: (value) => value.pollResults,
  })
  pollResults(@Args('pollId') pollId: string) {
    return new Promise((resolve) => {
      pubSub.once('pollResults', (data) => {
        if (data.pollResults.pollId === pollId) {
          resolve(data.pollResults);
        }
      });
    });
  }
}
