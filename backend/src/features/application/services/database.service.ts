import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import { S3Service } from './s3.service';

export type PrismaTransactionClient = Omit<
  typeof DatabaseService.prototype.prisma,
  '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'
>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private s3Service: S3Service) {}

  public prisma = new PrismaClient()
    .$extends({
      model: {
        $allModels: {
          async findManyAndCount<Model, Args>(
            this: Model,
            args: Prisma.Exact<Args, Prisma.Args<Model, 'findMany'>>,
          ): Promise<{
            data: Prisma.Result<Model, Args, 'findMany'>;
            count: number;
          }> {
            type FindManyArgs = Prisma.Args<Model, 'findMany'>;
            type CountArgs = Prisma.Args<Model, 'count'>;

            const modelDelegate = this as unknown as {
              findMany(
                a: FindManyArgs,
              ): Promise<Prisma.Result<Model, Args, 'findMany'>>;
              count(a: CountArgs): Promise<number>;
            };

            type WhereType = CountArgs extends { where: infer W } ? W : never;

            const [data, count] = await Promise.all([
              modelDelegate.findMany(args as FindManyArgs),
              modelDelegate.count({
                where: (args as FindManyArgs).where as WhereType,
              } as CountArgs),
            ]);

            return { data, count };
          },
        },
      },
    })
    .$extends({
      query: {
        media: {
          delete: async ({ args, query }) => {
            // -- Fetch the media record to get the key
            const media = await this.prisma.media.findUnique({
              where: { id: args.where.id },
            });

            // -- Run the query and throw an error if the query fails
            const queryResult = await query(args);

            // -- The record was deleted successfully...
            if (media) {
              // Delete the file from S3
              await this.s3Service.deleteFile({ key: media.key });
            }

            return queryResult;
          },
        },
      },
    });

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
