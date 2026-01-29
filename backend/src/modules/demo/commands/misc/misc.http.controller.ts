import {
  Cache,
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Req,
  Res,
  SerializeOptions,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import path from 'node:path';
import { AllowAnonymous } from 'src/modules/core/decorators/allow-anonymous.decorator';
import { Roles } from 'src/modules/core/decorators/roles.decorator';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { PdfService } from 'src/modules/shared/services/pdf.service';
import { DemoSerializeTestDto } from './misc.response.dto';

@Controller()
export class DemoMiscController {
  constructor(
    private readonly db: DatabaseService,
    private readonly pdfService: PdfService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

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

  @Get('/demos/protected-route')
  protectedRoute(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      message: 'Protected route.',
      sessionId: user.sessionId,
      role: user.role,
      accountId: user.accountId,
      email: user.email,
    };
  }

  @Get('/demos/protected-route-customer')
  @Roles(['CUSTOMER'])
  async protectedRouteCustomer(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException();
    }

    const customer = await this.db.prisma.customer.findFirst({
      where: { accountId: user.accountId },
    });

    if (!customer) {
      throw new UnauthorizedException();
    }

    return {
      message: 'Protected route for customer.',
      sessionId: user.sessionId,
      role: user.role,
      accountId: user.accountId,
      email: user.email,
      customerId: customer.id,
    };
  }

  @Get('/demos/strict-throttler')
  @AllowAnonymous()
  @Throttle({ long: { limit: 10 } })
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
}
