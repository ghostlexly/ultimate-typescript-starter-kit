import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LaunchQueueCommand } from './launch-queue.command';

@CommandHandler(LaunchQueueCommand)
export class LaunchQueueHandler implements ICommandHandler<LaunchQueueCommand> {
  constructor(@InjectQueue('demo') private readonly demoQueue: Queue) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(command: LaunchQueueCommand) {
    await this.demoQueue.add('testingJob', { message: 'Hello World' });

    return {
      message: 'Job added to queue.',
    };
  }
}
