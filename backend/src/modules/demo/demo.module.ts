import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';
import { DemoController } from './controllers/demo.controller';
import { DemoCustomerController } from './controllers/demo.customer.controller';
import { TestPlayerHandler } from './commands/test-player/test-player.handler';
import { LaunchQueueHandler } from './commands/launch-queue/launch-queue.handler';
import { KillDragonHandler } from './commands/kill-dragon/kill-dragon.handler';
import { FindAllAccountsHandler } from './queries/find-all-accounts/find-all-accounts.handler';
import { GetPaginatedDataHandler } from './queries/get-paginated-data/get-paginated-data.handler';

const CommandHandlers = [TestPlayerHandler, LaunchQueueHandler, KillDragonHandler];

const QueryHandlers = [FindAllAccountsHandler, GetPaginatedDataHandler];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  controllers: [DemoController, DemoCustomerController],
  providers: [DemoConsumer, ...CommandHandlers, ...QueryHandlers],
})
export class DemoModule {}
