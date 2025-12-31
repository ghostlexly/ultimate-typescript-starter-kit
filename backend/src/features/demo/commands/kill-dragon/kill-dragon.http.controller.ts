import { Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { KillDragonCommand } from './kill-dragon.command';
import { type KillDragonResult } from './kill-dragon.service';

@Controller()
export class KillDragonHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/demos/cqrs-kill-dragon')
  @AllowAnonymous()
  async killDragon() {
    const response = await this.commandBus.execute<
      KillDragonCommand,
      KillDragonResult
    >(new KillDragonCommand('20', '17'));

    return {
      message: `The dragon #${response.dragonId} has been killed by #${response.heroId}, confirmation: ${response.killed}.`,
    };
  }
}
