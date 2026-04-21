import {
  Cache,
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import path from 'node:path';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { PdfService } from '../../shared/services/pdf.service';
import { DemoSerializeTestResponse } from '../dtos/misc.response';
import { TestPlayerBody, TestPlayerQuery } from '../dtos/test-player.request';
import { GetPaginatedDataQuery } from '../dtos/get-paginated-data.request';
import { TestPlayerCommand } from '../commands/test-player/test-player.command';
import { LaunchQueueCommand } from '../commands/launch-queue/launch-queue.command';
import { KillDragonCommand } from '../commands/kill-dragon/kill-dragon.command';
import { FindAllAccountsCommand } from '../commands/find-all-accounts/find-all-accounts.command';
import { GetPaginatedDataCommand } from '../commands/get-paginated-data/get-paginated-data.command';
import { AuthenticationPrincipal } from '../../../core/decorators/authentication-principal.decorator';
import type { UserPrincipal } from '../../../core/types/request';

@Controller()
export class DemoPublicController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly pdfService: PdfService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get('/demos')
  @AllowAnonymous()
  async findAllAccounts() {
    return this.commandBus.execute(new FindAllAccountsCommand());
  }

  @Post('/demos')
  @AllowAnonymous()
  testPlayer(@Body() body: TestPlayerBody, @Query() query: TestPlayerQuery) {
    return this.commandBus.execute(new TestPlayerCommand({ ...body, ...query }));
  }

  @Get('/demos/paginated-data')
  @AllowAnonymous()
  async getPaginatedData(@Query() query: GetPaginatedDataQuery) {
    return this.commandBus.execute(new GetPaginatedDataCommand({ query }));
  }

  @Get('/demos/queue-launch')
  @AllowAnonymous()
  async queueLaunch() {
    return this.commandBus.execute(new LaunchQueueCommand());
  }

  @Post('/demos/cqrs-kill-dragon')
  @AllowAnonymous()
  async killDragon() {
    const response = await this.commandBus.execute(
      new KillDragonCommand({
        dragonId: '17',
        heroId: '20',
      }),
    );

    return {
      message: `The dragon #${response.dragonId} has been killed by #${response.heroId}, confirmation: ${response.killed}.`,
    };
  }

  @Get('/demos/serialize-with-class')
  @AllowAnonymous()
  @UseInterceptors(ClassSerializerInterceptor)
  serializeWithClass() {
    return new DemoSerializeTestResponse({
      firstName: 'John',
      lastName: 'Doe',
      password: '123456',
      age: 30,
    });
  }

  @Get('/demos/serialize-with-options')
  @AllowAnonymous()
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: DemoSerializeTestResponse,
    excludeExtraneousValues: true,
  })
  serializeWithPipe(): DemoSerializeTestResponse {
    return {
      firstName: 'John',
      lastName: 'Doe',
      password: '123456',
      age: 30,
      person: {
        name: 'John Doe',
      },
    };
  }

  @Get('/demos/public-route')
  @AllowAnonymous()
  publicRoute() {
    return {
      message: 'Public route.',
    };
  }

  @Get('/demos/strict-throttler')
  @AllowAnonymous()
  @Throttle({ default: { limit: 10 } })
  strictThrottler() {
    return {
      message: 'Strict throttler.',
    };
  }

  @Get('/demos/throw-unhandled-error')
  @AllowAnonymous()
  throwUnhandledError() {
    throw new Error('Unhandled error');
  }

  @Get('/demos/pdf-generation')
  @AllowAnonymous()
  async testPdfGeneration(@Res() res: Response) {
    const template = await fs.readFile(
      path.join(process.cwd(), 'dist', 'views', 'invoice.hbs'),
      'utf-8',
    );

    const compileTemplate = handlebars.compile(template);
    const renderedTemplate = compileTemplate(
      {
        name: 'John Doe',
      },
      {
        helpers: {
          formatCurrency: (value: unknown) => {
            const numericValue = typeof value === 'number' ? value : Number(value);

            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(numericValue);
          },
          formatDate: (date: string) => {
            return new Intl.DateTimeFormat('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(date));
          },
        },
      },
    );

    const pdfBuffer = await this.pdfService.convertHtmlToPdf({
      html: renderedTemplate,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

    return res.send(pdfBuffer);
  }

  @Get('/demos/cached-by-interceptor')
  @AllowAnonymous()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('cached-response')
  @CacheTTL(5000)
  testCachedResponse() {
    return {
      message: 'Cached response.',
      date: new Date().toISOString(),
    };
  }

  @Get('/demos/cached-by-service')
  @AllowAnonymous()
  async testCachedData() {
    const cacheKey = 'cached-data';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const data = {
      message: 'Cached response.',
      date: new Date().toISOString(),
    };

    // ttl in milliseconds
    await this.cacheManager.set(cacheKey, data, 5000);

    return data;
  }

  @Get('/demos/protected-route')
  protectedRoute(@AuthenticationPrincipal() principal: UserPrincipal) {
    return {
      message: 'Protected route.',
      sessionId: principal.sessionId,
      role: principal.role,
      accountId: principal.accountId,
      email: principal.email,
    };
  }
}
