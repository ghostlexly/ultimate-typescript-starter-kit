import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';
import { FindAllAccountsController } from './queries/find-all-accounts/find-all-accounts.http.controller';
import { FindAllAccountsQueryHandler } from './queries/find-all-accounts/find-all-accounts.query-handler';
import { GetPaginatedDataController } from './queries/get-paginated-data/get-paginated-data.http.controller';
import { GetPaginatedDataQueryHandler } from './queries/get-paginated-data/get-paginated-data.query-handler';
import { GetCitiesController } from './queries/get-cities/get-cities.http.controller';
import { GetCitiesQueryHandler } from './queries/get-cities/get-cities.query-handler';
import { TestPlayerController } from './commands/test-player/test-player.http.controller';
import { TestPlayerHandler } from './commands/test-player/test-player.handler';
import { LaunchQueueController } from './commands/launch-queue/launch-queue.http.controller';
import { LaunchQueueHandler } from './commands/launch-queue/launch-queue.handler';
import { KillDragonController } from './commands/kill-dragon/kill-dragon.http.controller';
import { KillDragonHandler } from './commands/kill-dragon/kill-dragon.handler';
import { DemoMiscController } from './commands/misc/misc.http.controller';

const CommandHandlers = [
  TestPlayerHandler,
  LaunchQueueHandler,
  KillDragonHandler,
];

const QueryHandlers = [
  FindAllAccountsQueryHandler,
  GetPaginatedDataQueryHandler,
  GetCitiesQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  controllers: [
    FindAllAccountsController,
    GetPaginatedDataController,
    GetCitiesController,
    TestPlayerController,
    LaunchQueueController,
    KillDragonController,
    DemoMiscController,
  ],
  providers: [DemoConsumer, ...CommandHandlers, ...QueryHandlers],
})
export class DemoModule {}
