import { REDIS_CONNECTION } from "#/infrastructure/cache/redis";
import { bullmqService } from "#/infrastructure/queue/bull/bullmq";
import { Queue, Worker } from "bullmq";
import path from "path";

class QueueService {
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue("app", {
      connection: REDIS_CONNECTION,
    });

    this.worker = new Worker(
      "app", // queue name
      path.join(__dirname, "app.worker.js"),
      {
        connection: REDIS_CONNECTION,
        removeOnComplete: { count: 10 },
      }
    );

    // -- Worker Events
    bullmqService.initWorkerEventsLogger({
      worker: this.worker,
    });
  }

  public close = async () => {
    await this.worker.close();
    await this.worker.disconnect();

    await this.queue.close();
    await this.queue.disconnect();
  };

  public addTestingJob = (message: string) => {
    this.queue.add("testingJob", { message });
  };

  public addOptimizeVideoJob = (mediaId: string) => {
    this.queue.add("optimizeVideoJob", { mediaId });
  };
}

export const queueService = new QueueService();
