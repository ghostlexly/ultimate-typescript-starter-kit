import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DemoConsumer } from './demo.consumer';

// Commands
import { CreatePlayerHttpController } from './commands/create-player/create-player.http.controller';
import { CreatePlayerService } from './commands/create-player/create-player.service';
import { LaunchQueueHttpController } from './commands/launch-queue/launch-queue.http.controller';
import { LaunchQueueService } from './commands/launch-queue/launch-queue.service';
import { KillDragonHttpController } from './commands/kill-dragon/kill-dragon.http.controller';
import { KillDragonService } from './commands/kill-dragon/kill-dragon.service';

// Queries
import { GetAllAccountsHttpController } from './queries/get-all-accounts/get-all-accounts.http.controller';
import { GetAllAccountsQueryHandler } from './queries/get-all-accounts/get-all-accounts.query-handler';
import { GetSerializedClassHttpController } from './queries/get-serialized-class/get-serialized-class.http.controller';
import { GetSerializedClassQueryHandler } from './queries/get-serialized-class/get-serialized-class.query-handler';
import { GetSerializedOptionsHttpController } from './queries/get-serialized-options/get-serialized-options.http.controller';
import { GetSerializedOptionsQueryHandler } from './queries/get-serialized-options/get-serialized-options.query-handler';
import { GetPublicRouteHttpController } from './queries/get-public-route/get-public-route.http.controller';
import { GetPublicRouteQueryHandler } from './queries/get-public-route/get-public-route.query-handler';
import { GetProtectedRouteHttpController } from './queries/get-protected-route/get-protected-route.http.controller';
import { GetProtectedRouteQueryHandler } from './queries/get-protected-route/get-protected-route.query-handler';
import { GetProtectedRouteCustomerHttpController } from './queries/get-protected-route-customer/get-protected-route-customer.http.controller';
import { GetProtectedRouteCustomerQueryHandler } from './queries/get-protected-route-customer/get-protected-route-customer.query-handler';
import { GetThrottledHttpController } from './queries/get-throttled/get-throttled.http.controller';
import { GetThrottledQueryHandler } from './queries/get-throttled/get-throttled.query-handler';
import { ThrowErrorHttpController } from './queries/throw-error/throw-error.http.controller';
import { ThrowErrorQueryHandler } from './queries/throw-error/throw-error.query-handler';
import { GeneratePdfHttpController } from './queries/generate-pdf/generate-pdf.http.controller';
import { GeneratePdfQueryHandler } from './queries/generate-pdf/generate-pdf.query-handler';
import { GetCachedInterceptorHttpController } from './queries/get-cached-interceptor/get-cached-interceptor.http.controller';
import { GetCachedInterceptorQueryHandler } from './queries/get-cached-interceptor/get-cached-interceptor.query-handler';
import { GetCachedServiceHttpController } from './queries/get-cached-service/get-cached-service.http.controller';
import { GetCachedServiceQueryHandler } from './queries/get-cached-service/get-cached-service.query-handler';
import { GetPaginatedDataHttpController } from './queries/get-paginated-data/get-paginated-data.http.controller';
import { GetPaginatedDataQueryHandler } from './queries/get-paginated-data/get-paginated-data.query-handler';
import { GetCitiesHttpController } from './queries/get-cities/get-cities.http.controller';
import { GetCitiesQueryHandler } from './queries/get-cities/get-cities.query-handler';

const CommandHandlers = [
  CreatePlayerService,
  LaunchQueueService,
  KillDragonService,
];

const QueryHandlers = [
  GetAllAccountsQueryHandler,
  GetSerializedClassQueryHandler,
  GetSerializedOptionsQueryHandler,
  GetPublicRouteQueryHandler,
  GetProtectedRouteQueryHandler,
  GetProtectedRouteCustomerQueryHandler,
  GetThrottledQueryHandler,
  ThrowErrorQueryHandler,
  GeneratePdfQueryHandler,
  GetCachedInterceptorQueryHandler,
  GetCachedServiceQueryHandler,
  GetPaginatedDataQueryHandler,
  GetCitiesQueryHandler,
];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'demo',
    }),
  ],
  controllers: [
    // Commands
    CreatePlayerHttpController,
    LaunchQueueHttpController,
    KillDragonHttpController,
    // Queries
    GetAllAccountsHttpController,
    GetSerializedClassHttpController,
    GetSerializedOptionsHttpController,
    GetPublicRouteHttpController,
    GetProtectedRouteHttpController,
    GetProtectedRouteCustomerHttpController,
    GetThrottledHttpController,
    ThrowErrorHttpController,
    GeneratePdfHttpController,
    GetCachedInterceptorHttpController,
    GetCachedServiceHttpController,
    GetPaginatedDataHttpController,
    GetCitiesHttpController,
  ],
  providers: [DemoConsumer, ...CommandHandlers, ...QueryHandlers],
})
export class DemoModule {}
