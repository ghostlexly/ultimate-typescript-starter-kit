import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LaunchQueueCommand } from './launch-queue.command';

@CommandHandler(LaunchQueueCommand)
export class LaunchQueueHandler implements ICommandHandler<LaunchQueueCommand> {
  constructor(@InjectQueue('demo') private readonly demoQueue: Queue) {}

  async execute(_command: LaunchQueueCommand) {
    await this.demoQueue.add('testingJob', { message: 'Hello World' });

    return {
      message: 'Job added to queue.',
    };
  }
}
