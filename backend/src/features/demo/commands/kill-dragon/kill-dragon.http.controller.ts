import { Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { KillDragonCommand } from './kill-dragon.command';

@Controller()
export class KillDragonController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/demos/cqrs-kill-dragon')
  @AllowAnonymous()
  async cqrsKillDragon() {
    const response = await this.commandBus.execute(
      new KillDragonCommand({ dragonId: '17', heroId: '20' }),
    );

    return {
      message: `The dragon #${response.dragonId} has been killed by #${response.heroId}, confirmation: ${response.killed}.`,
    };
  }
}
