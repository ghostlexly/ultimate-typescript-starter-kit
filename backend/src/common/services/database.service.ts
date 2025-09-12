import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { S3Service } from './s3.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private s3Service: S3Service) {}

  public prisma = new PrismaClient().$extends({
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
