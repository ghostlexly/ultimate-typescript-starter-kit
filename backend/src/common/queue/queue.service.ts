import { REDIS_CONNECTION } from "@/common/services/redis.service";
import { bullmqService } from "@/common/queue/bullmq";
import { Queue, Worker, WorkerOptions } from "bullmq";
import path from "path";

class QueueService {
  public queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor() {
    // Create separate queues and workers for each job type with specific concurrency
    this.createQueueAndWorker("optimizeVideoJob", {
      concurrency: 1,
    });
    this.createQueueAndWorker("testingJob", {
      concurrency: 1,
    });
  }

  private createQueueAndWorker(
    jobName: string,
    options: Partial<WorkerOptions>
  ) {
    // Create dedicated queue for this job type
    const queue = new Queue(jobName, {
      connection: REDIS_CONNECTION,
    });

    // Create dedicated worker for this job type
    const worker = new Worker(
      jobName, // queue name matches job type
      path.join(__dirname, "app.worker.js"),
      {
        connection: REDIS_CONNECTION,
        removeOnComplete: { count: 10 },
        ...options,
      }
    );

    this.queues.set(jobName, queue);
    this.workers.set(jobName, worker);

    // -- Worker Events
    bullmqService.initWorkerEventsLogger({
      worker,
    });
  }

  public close = async () => {
    // Close all workers
    for (const worker of this.workers.values()) {
      await worker.close();
      await worker.disconnect();
    }

    // Close all queues
    for (const queue of this.queues.values()) {
      await queue.close();
      await queue.disconnect();
    }
  };

  public addOptimizeVideoJob = (mediaId: string) => {
    const queue = this.queues.get("optimizeVideoJob");
    if (queue) {
      queue.add("optimizeVideoJob", { mediaId });
    }
  };

  public addTestingJob = (message: string) => {
    const queue = this.queues.get("testingJob");
    if (queue) {
      queue.add("testingJob", { message });
    }
  };
}

export const queueService = new QueueService();
