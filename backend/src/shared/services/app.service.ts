import { queueService } from "#/infrastructure/queue/bull/queue.service";
import { redisService } from "#/infrastructure/cache/redis";
import { prisma } from "#/infrastructure/database/prisma";

class AppService {
  cleanup = async () => {
    // Close all queue connections
    await queueService.close();

    // Close Redis connection
    await redisService.quit();

    // Close Prisma connection
    await prisma.$disconnect();
  };

  shutdownGracefully = async () => {
    try {
      await this.cleanup();
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  };
}

export const appService = new AppService();
