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
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import path from 'node:path';
import { AllowAnonymous } from '../../core/decorators/allow-anonymous.decorator';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { PdfService } from '../../shared/services/pdf.service';
import { DemoSerializeTestDto } from '../commands/misc/misc.response.dto';
import { TestPlayerHandler } from '../commands/test-player/test-player.handler';
import { LaunchQueueHandler } from '../commands/launch-queue/launch-queue.handler';
import { FindAllAccountsHandler } from '../queries/find-all-accounts/find-all-accounts.handler';
import { GetPaginatedDataHandler } from '../queries/get-paginated-data/get-paginated-data.handler';
import {
  testPlayerRequestSchema,
  type TestPlayerRequestDto,
} from '../commands/test-player/test-player.request.dto';
import {
  demoGetPaginatedDataSchema,
  type DemoGetPaginatedDataDto,
} from '../queries/get-paginated-data/get-paginated-data.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { KillDragonCommand } from '../commands/kill-dragon/kill-dragon.command';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../core/types/request';

@Controller()
export class DemoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly pdfService: PdfService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly testPlayerHandler: TestPlayerHandler,
    private readonly launchQueueHandler: LaunchQueueHandler,
    private readonly findAllAccountsHandler: FindAllAccountsHandler,
    private readonly getPaginatedDataHandler: GetPaginatedDataHandler,
  ) {}

  @Get('/demos')
  @AllowAnonymous()
  async findAllAccounts() {
    return this.findAllAccountsHandler.execute();
  }

  @Post('/demos')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(testPlayerRequestSchema))
  testPlayer(
    @Body() body: TestPlayerRequestDto['body'],
    @Query() query: TestPlayerRequestDto['query'],
  ) {
    return this.testPlayerHandler.execute({ ...body, ...query });
  }

  @Get('/demos/paginated-data')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(demoGetPaginatedDataSchema))
  async getPaginatedData(@Query() query: DemoGetPaginatedDataDto['query']) {
    return this.getPaginatedDataHandler.execute({ query });
  }

  @Get('/demos/queue-launch')
  @AllowAnonymous()
  async queueLaunch() {
    return this.launchQueueHandler.execute();
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
