import { Controller, Get } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { LaunchQueueCommand } from './launch-queue.command';

@Controller()
export class LaunchQueueHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/demos/queue-launch')
  @AllowAnonymous()
  async launchQueue() {
    return this.commandBus.execute(new LaunchQueueCommand());
  }
}
