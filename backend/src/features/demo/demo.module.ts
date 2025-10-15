import { Module } from '@nestjs/common';
import { DemoController } from './controllers/demo.controller';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';
import { KillDragonHandler } from './commands/handlers/kill-dragon.handler';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  providers: [DemoConsumer, KillDragonHandler],
  controllers: [DemoController],
})
export class DemoModule {}
