import { InjectQueue } from '@nestjs/bullmq';
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
  Req,
  Res,
  SerializeOptions,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { type Request } from 'express';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import { Public } from 'src/core/decorators/is-public.decorator';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import {
  buildQueryParams,
  transformWithPagination,
} from 'src/core/utils/page-query';
import { DatabaseService } from 'src/features/application/services/database.service';
import { PdfService } from 'src/features/application/services/pdf.service';
import { Prisma } from 'src/generated/prisma/client';
import { KillDragonCommand } from '../commands/impl/kill-dragon.command';
import { DemoSerializeTestDto } from '../dto/demo.dto';
import {
  type DemoGetPaginatedDataDto,
  type DemoTestPlayerDto,
  demoGetPaginatedDataSchema,
  demoTestPlayerSchema,
} from '../validators/demo.validators';

@Controller('demos')
export class DemoController {
  constructor(
    private db: DatabaseService,
    private commandBus: CommandBus,
    private pdfService: PdfService,
    @InjectQueue('demo') private demoQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * @description Try the Prisma Client
   */
  @Get()
  @Public()
  async findAll() {
    return await this.db.prisma.account.findManyAndCount({});
  }

  /**
   * @description Try the Zod Validation Pipe
   */
  @Post()
  @Public()
  @UsePipes(new ZodValidationPipe(demoTestPlayerSchema))
  create(
    @Body() body: DemoTestPlayerDto['body'],
    @Query() query: DemoTestPlayerDto['query'],
  ) {
    return { body, query };
  }

  /**
   * @description Try the Serialization Pipe
   */
  @Get('serialize-with-class')
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  serializeWithClass() {
    return new DemoSerializeTestDto({
      firstName: 'John',
      lastName: 'Doe',
      password: '123456',
      age: 30,
    });
  }

  /**
   * @description Try the Serialization Pipe
   */
  @Get('serialize-with-options')
  @Public()
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

  /**
   * @description Launch a test job with BullMQ
   */
  @Get('queue-launch')
  @Public()
  async testQueueLaunch() {
    await this.demoQueue.add('testingJob', { message: 'Hello World' });
    return {
      message: 'Job added to queue.',
    };
  }

  /**
   * @description Public route that doesn't require authentication
   */
  @Get('public-route')
  @Public()
  publicRoute() {
    return {
      message: 'Public route.',
    };
  }

  /**
   * @description Protected route that requires authentication
   */
  @Get('protected-route')
  protectedRoute() {
    return {
      message: 'Public route.',
    };
  }

  /**
   * @description Protected route that requires authentication and customer role
   */
  @Get('protected-route-customer')
  @Roles(['CUSTOMER'])
  protectedRouteCustomer(@Req() req: Request) {
    const customer = req.user?.customer;

    if (!customer) {
      throw new UnauthorizedException();
    }

    return {
      message: 'Protected route for customer.',
      customerId: customer.id,
    };
  }

  /**
   * @description Strict throttler (rate-limiting)
   * Will block the IP Address after 10 attempts.
   */
  @Get('strict-throttler')
  @Public()
  @Throttle({ long: { limit: 10 } })
  strictThrottler() {
    return {
      message: 'Strict throttler.',
    };
  }

  @Get('throw-unhandled-error')
  @Public()
  throwUnhandledError() {
    throw new Error('Unhandled error');
  }

  @Get('pdf-generation')
  @Public()
  async testPdfGeneration(@Res() res: Response) {
    // Get template
    const template = await fs.readFile(
      path.join(process.cwd(), 'views', 'invoice.hbs'),
      'utf-8',
    );

    // Render template
    const compileTemplate = handlebars.compile(template);
    const renderedTemplate = compileTemplate(
      {
        name: 'John Doe',
      },
      {
        helpers: {
          formatCurrency: (value: unknown) => {
            const numericValue =
              typeof value === 'number' ? value : Number(value);
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

    // Generate PDF
    const pdfBuffer = await this.pdfService.htmlToPdf({
      html: renderedTemplate,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');
    return res.send(pdfBuffer);
  }

  @Get('cached-by-interceptor')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('cached-response')
  @CacheTTL(5000) // 5 seconds
  testCachedResponse() {
    return {
      message: 'Cached response.',
      date: new Date().toISOString(),
    };
  }

  @Get('cached-by-service')
  @Public()
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

  @Get('paginated-data')
  @Public()
  async getPaginatedData(
    @Query(new ZodValidationPipe(demoGetPaginatedDataSchema))
    query: DemoGetPaginatedDataDto['query'],
  ) {
    const filterConditions: Prisma.CustomerWhereInput[] = [
      {
        account: {
          role: 'CUSTOMER',
        },
      },
    ];

    const { pagination, orderBy, includes } = buildQueryParams({
      query,
      defaultSort: { createdAt: 'desc' },
      allowedSortFields: ['createdAt', 'id', 'barcodeAnalysis.productName'],
    });

    // --------------------------------------
    // Filters
    // --------------------------------------
    if (query.id) {
      filterConditions.push({
        id: {
          equals: query.id,
        },
      });
    }

    // --------------------------------------
    // Query
    // --------------------------------------
    const { data, count } = await this.db.prisma.customer.findManyAndCount({
      include: {
        ...(includes.has('account') && { account: true }),
      },
      where: {
        AND: filterConditions,
      },
      orderBy: orderBy,
      take: pagination.take,
      skip: pagination.skip,
    });

    return transformWithPagination({
      data: data,
      count,
      page: pagination.currentPage,
      first: pagination.itemsPerPage,
    });
  }

  @Post('cqrs-kill-dragon')
  @Public()
  async cqrsKillDragon() {
    const response = await this.commandBus.execute(
      new KillDragonCommand({ dragonId: '17', heroId: '20' }),
    );

    return {
      message: `The dragon #${response.dragonId} has been killed by #${response.heroId}, confirmation: ${response.killed}.`,
    };
  }
}
