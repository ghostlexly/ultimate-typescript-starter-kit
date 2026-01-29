import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { dateUtils } from 'src/modules/core/utils/date';
import { MediaService } from '../../media/media.service';

@Injectable()
export class ClearOrphanMediasJob {
  private logger = new Logger(ClearOrphanMediasJob.name);

  constructor(
    private db: DatabaseService,
    private readonly mediaService: MediaService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async execute() {
    try {
      this.logger.log('[⏰ SCHEDULER]: Running: Clear orphan medias job');

      // Identify the orphan media records
      const orphanMedias = await this.db.prisma.media.findMany({
        where: {
          AND: [
            // {
            //   housekeeperAvatar: null,
            // },
            // {
            //   housekeeperDocumentsMedias: {
            //     none: {},
            //   },
            // },
          ],

          createdAt: {
            lt: dateUtils.sub(new Date(), { hours: 24 }), // older than 24 hours records
          },
        },
      });

      // Delete the orphan media records
      for (const orphanMedia of orphanMedias) {
        this.logger.debug(
          `Deleting orphan media #${orphanMedia.id} with key [${orphanMedia.key}]...`,
        );

        // Get the record from the database
        const media = await this.db.prisma.media.findUnique({
          where: {
            id: orphanMedia.id,
          },
        });

        if (!media) {
          this.logger.error(
            `Error deleting orphan media #${orphanMedia.id}: Media to delete cannot be found.`,
          );

          return false;
        }

        // Delete the record from the database
        await this.mediaService.deleteMedia({
          id: media.id,
        });
      }
    } catch (error) {
      this.logger.error('Error during orphan media removal:', error);
    } finally {
      this.logger.log('[⏰ SCHEDULER]: Scheduled clear orphan medias job completed');
    }
  }
}
