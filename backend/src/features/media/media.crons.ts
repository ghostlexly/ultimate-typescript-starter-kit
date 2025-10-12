import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/features/application/services/database.service';
import { dateUtils } from 'src/common/utils/date';

@Injectable()
export class MediaCrons {
  private logger = new Logger(MediaCrons.name);

  constructor(private db: DatabaseService) {}

  @Cron('0 0 */3 * * *') // Every 3 hours
  async deleteOrphanMedias() {
    try {
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
          throw new Error('Media to delete cannot be found.');
        }

        // Delete the record from the database
        await this.db.prisma.media
          .delete({
            where: {
              id: media.id,
            },
          })
          .catch((err) => {
            this.logger.error(
              `Error deleting orphan media #${media.id}: ${err.message}`,
            );
          });
      }

      this.logger.debug('All orphan medias are been removed successfully.');
    } catch (error) {
      this.logger.error('Error during orphan media removal:', error);
    }
  }
}
