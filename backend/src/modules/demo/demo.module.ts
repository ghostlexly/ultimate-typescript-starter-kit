import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';
import { FindAllAccountsController } from './queries/find-all-accounts/find-all-accounts.http.controller';
import { FindAllAccountsHandler } from './queries/find-all-accounts/find-all-accounts.handler';
import { GetPaginatedDataController } from './queries/get-paginated-data/get-paginated-data.http.controller';
import { GetPaginatedDataHandler } from './queries/get-paginated-data/get-paginated-data.handler';
import { TestPlayerController } from './commands/test-player/test-player.http.controller';
import { TestPlayerHandler } from './commands/test-player/test-player.handler';
import { LaunchQueueController } from './commands/launch-queue/launch-queue.http.controller';
import { LaunchQueueHandler } from './commands/launch-queue/launch-queue.handler';
import { KillDragonController } from './commands/kill-dragon/kill-dragon.http.controller';
import { KillDragonHandler } from './commands/kill-dragon/kill-dragon.handler';
import { DemoMiscController } from './commands/misc/misc.http.controller';

const CommandHandlers = [TestPlayerHandler, LaunchQueueHandler, KillDragonHandler];

const QueryHandlers = [FindAllAccountsHandler, GetPaginatedDataHandler];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  controllers: [
    FindAllAccountsController,
    GetPaginatedDataController,
    TestPlayerController,
    LaunchQueueController,
    KillDragonController,
    DemoMiscController,
  ],
  providers: [DemoConsumer, ...CommandHandlers, ...QueryHandlers],
})
export class DemoModule {}
