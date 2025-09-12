import { InjectQueue } from '@nestjs/bullmq';
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
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/is-public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { DatabaseService } from 'src/common/services/database.service';
import { PdfService } from 'src/common/services/pdf.service';
import type { DemosTestPlayerDto } from '../validators/demos.validators';
import { demosTestPlayerSchema } from '../validators/demos.validators';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import {
  Cache,
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { DemosSerializeTestDto } from '../dto/demos.dto';
import {
  buildQueryParams,
  type PageQueryInput,
  pageQuerySchema,
  transformWithPagination,
} from 'src/common/utils/page-query';
import { Prisma } from 'src/generated/prisma/client';

@Controller('demos')
export class DemosController {
  constructor(
    private db: DatabaseService,
    private pdfService: PdfService,
    @InjectQueue('demos') private demosQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * @description Try the Prisma Client
   */
  @Get()
  @Public()
  async findAll() {
    return await this.db.prisma.account.findMany();
  }

  /**
   * @description Try the Zod Validation Pipe
   */
  @Post()
  @Public()
  @UsePipes(new ZodValidationPipe(demosTestPlayerSchema))
  create(@Body() body: DemosTestPlayerDto) {
    return body;
  }

  /**
   * @description Try the Serialization Pipe
   */
  @Get('serialize-with-class')
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  serializeWithClass() {
    return new DemosSerializeTestDto({
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
    type: DemosSerializeTestDto,
    excludeExtraneousValues: true,
  })
  serializeWithPipe(): DemosSerializeTestDto {
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
    await this.demosQueue.add('testingJob', { message: 'Hello World' });
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
  protectedRouteCustomer() {
    return {
      message: 'Protected route for customer.',
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
    const renderedTemplate = handlebars.compile(template)({ name: 'John Doe' });

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
    @Query(new ZodValidationPipe(pageQuerySchema)) query: PageQueryInput,

    // filters (example)
    @Query('id') id: string,
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
    if (id) {
      filterConditions.push({
        id: {
          equals: id,
        },
      });
    }

    // --------------------------------------
    // Query
    // --------------------------------------
    const prismaQuery = {
      include: {
        ...(includes.has('account') && { account: true }),
      },
      where: {
        AND: filterConditions,
      },
      orderBy: (orderBy as
        | Prisma.CustomerOrderByWithRelationInput
        | Prisma.CustomerOrderByWithRelationInput[]) ?? {
        createdAt: 'desc',
      },
      take: pagination.take,
      skip: pagination.skip,
    } satisfies Prisma.CustomerFindManyArgs;

    const [data, count] = await this.db.prisma.$transaction([
      this.db.prisma.customer.findMany(prismaQuery),
      this.db.prisma.customer.count({
        where: prismaQuery.where,
      }),
    ]);

    return transformWithPagination({
      data: data,
      count,
      page: pagination.currentPage,
      first: pagination.itemsPerPage,
    });
  }
}
