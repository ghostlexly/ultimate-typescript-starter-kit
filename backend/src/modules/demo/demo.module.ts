import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';
import { DemoPublicController } from './controllers/demo.public.controller';
import { DemoCustomerController } from './controllers/demo.customer.controller';
import { TestPlayerHandler } from './commands/test-player/test-player.handler';
import { LaunchQueueHandler } from './commands/launch-queue/launch-queue.handler';
import { KillDragonHandler } from './commands/kill-dragon/kill-dragon.handler';
import { FindAllAccountsHandler } from './commands/find-all-accounts/find-all-accounts.handler';
import { GetPaginatedDataHandler } from './commands/get-paginated-data/get-paginated-data.handler';

const CommandHandlers = [
  TestPlayerHandler,
  LaunchQueueHandler,
  KillDragonHandler,
  FindAllAccountsHandler,
  GetPaginatedDataHandler,
];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  controllers: [DemoPublicController, DemoCustomerController],
  providers: [DemoConsumer, ...CommandHandlers],
})
export class DemoModule {}
