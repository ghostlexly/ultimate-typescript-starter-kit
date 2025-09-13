import { Module } from '@nestjs/common';
import { DemoController } from './controllers/demo.controller';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  providers: [DemoConsumer],
  controllers: [DemoController],
})
export class DemoModule {}
