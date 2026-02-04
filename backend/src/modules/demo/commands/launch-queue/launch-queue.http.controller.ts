import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { LaunchQueueHandler } from './launch-queue.handler';

@Controller()
export class LaunchQueueController {
  constructor(private readonly handler: LaunchQueueHandler) {}

  @Get('/demos/queue-launch')
  @AllowAnonymous()
  async testQueueLaunch() {
    return this.handler.execute();
  }
}
