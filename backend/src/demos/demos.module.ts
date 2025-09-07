import { Module } from '@nestjs/common';
import { DemosController } from './controllers/demos.controller';
import { BullModule } from '@nestjs/bullmq';
import { DemosConsumer } from './demos.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demos',
    }),
  ],
  providers: [DemosConsumer],
  controllers: [DemosController],
})
export class DemosModule {}
