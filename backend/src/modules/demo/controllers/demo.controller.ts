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
  UsePipes,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import path from 'node:path';
import { AllowAnonymous } from '../../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../../core/pipes/zod-validation.pipe';
import { PdfService } from '../../shared/services/pdf.service';
import { DemoSerializeTestDto } from '../commands/misc/misc.response.dto';
import { TestPlayerCommand } from '../commands/test-player/test-player.command';
import { LaunchQueueCommand } from '../commands/launch-queue/launch-queue.command';
import { KillDragonCommand } from '../commands/kill-dragon/kill-dragon.command';
import { FindAllAccountsQuery } from '../queries/find-all-accounts/find-all-accounts.query';
import { GetPaginatedDataQuery } from '../queries/get-paginated-data/get-paginated-data.query';
import {
  type TestPlayerRequestDto,
  testPlayerRequestSchema,
} from '../commands/test-player/test-player.request.dto';
import {
  type DemoGetPaginatedDataDto,
  demoGetPaginatedDataSchema,
} from '../queries/get-paginated-data/get-paginated-data.request.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../../core/types/request';

@Controller()
export class DemoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly pdfService: PdfService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get('/demos')
  @AllowAnonymous()
  async findAllAccounts() {
    return this.queryBus.execute(new FindAllAccountsQuery());
  }

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(testPlayerRequestSchema))
  testPlayer(
    @Body() body: TestPlayerRequestDto['body'],
    @Query() query: TestPlayerRequestDto['query'],
  ) {
    return this.commandBus.execute(new TestPlayerCommand({ ...body, ...query }));
  }

  @Get('/demos/paginated-data')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoGetPaginatedDataSchema))
  async getPaginatedData(@Query() query: DemoGetPaginatedDataDto['query']) {
    return this.queryBus.execute(new GetPaginatedDataQuery({ query }));
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
    return new DemoSerializeTestDto({
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
    type: DemoSerializeTestDto,
    excludeExtraneousValues: true,
  })
  serializeWithPipe(): DemoSerializeTestDto {
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

    const pdfBuffer = await this.pdfService.htmlToPdf({
      html: renderedTemplate,
    });

    res.setHeader('Content-Type', 'shared/pdf');
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
  protectedRoute(@CurrentUser() user: RequestUser) {
    return {
      message: 'Protected route.',
      sessionId: user.sessionId,
      role: user.role,
      accountId: user.accountId,
      email: user.email,
    };
  }
}
