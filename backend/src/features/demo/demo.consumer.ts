import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('demo', { removeOnComplete: { count: 10 }, concurrency: 5 })
export class DemoConsumer extends WorkerHost {
  private logger = new Logger(DemoConsumer.name);

  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      this.logger.debug('job progress:' + progress);

      await new Promise((resolve) => setTimeout(resolve, 10));
      progress += 1;
      await job.updateProgress(progress);
    }

    this.logger.debug('job data:', job.data);
  }
}
