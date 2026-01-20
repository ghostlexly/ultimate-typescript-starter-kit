import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { S3Service } from './s3.service';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

type ModelName = Uncapitalize<Prisma.ModelName>;

class ExtendedPrismaClient extends PrismaClient {
  async findManyAndCount<
    M extends ModelName,
    A extends Prisma.Args<PrismaClient[M], 'findMany'>,
  >(
    model: M,
    args: A,
  ): Promise<{
    data: Prisma.Result<PrismaClient[M], A, 'findMany'>;
    count: number;
  }> {
    const delegate = this[model] as {
      findMany(args: unknown): Promise<unknown[]>;
      count(args: unknown): Promise<number>;
    };

    const [data, count] = await Promise.all([
      delegate.findMany(args),
      delegate.count({ where: (args as { where?: unknown }).where }),
    ]);

    return {
      data: data as Prisma.Result<PrismaClient[M], typeof args, 'findMany'>,
      count,
    };
  }
}

export type PrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'
>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public prisma: ExtendedPrismaClient;
  private readonly pool: Pool;
  private readonly adapter: PrismaPg;

  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
  ) {
    const connectionString = this.configService.get<string>(
      'APP_DATABASE_CONNECTION_URL',
    );

    this.pool = new Pool({ connectionString });
    this.adapter = new PrismaPg(this.pool);
    this.prisma = new ExtendedPrismaClient({ adapter: this.adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  async deleteMedia(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    const result = await this.prisma.media.delete({
      where: { id },
    });

    if (media) {
      await this.s3Service.deleteFile({ key: media.key });
    }

    return result;
  }
}
