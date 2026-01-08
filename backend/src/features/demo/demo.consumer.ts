import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('demo', {
  concurrency: 5,
})
export class DemoConsumer extends WorkerHost {
  private readonly logger = new Logger(DemoConsumer.name);

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} with name ${job.name}`);
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
