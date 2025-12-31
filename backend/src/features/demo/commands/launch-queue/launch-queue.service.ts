import { InjectQueue } from '@nestjs/bullmq';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { LaunchQueueCommand } from './launch-queue.command';

@CommandHandler(LaunchQueueCommand)
export class LaunchQueueService implements ICommandHandler<LaunchQueueCommand> {
  constructor(@InjectQueue('demo') private readonly demoQueue: Queue) {}

  async execute() {
    await this.demoQueue.add('testingJob', { message: 'Hello World' });

    return {
      message: 'Job added to queue.',
    };
  }
}
