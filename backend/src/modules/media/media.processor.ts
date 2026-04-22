import { Job } from 'bullmq';
import { getJobContext } from '../../core/contexts/jobs.context';
import { optimizeVideoJob } from './jobs/optimize-video.job';

/**
 * Sandboxed entry point for the `media` queue.
 *
 * BullMQ forks a new Node process, loads this compiled file, and calls the
 * default export for every job. Route by `job.name` to the matching handler
 * — one `case` per job type. Keep this file thin: all business logic lives
 * in `./jobs/<name>.job.ts`.
 */
export default async function execute(job: Job): Promise<unknown> {
  const context = await getJobContext();

  switch (job.name) {
    case 'optimizeVideo':
      return optimizeVideoJob(job, context);

    default:
      throw new Error(`Unknown job name on media queue: ${job.name}`);
  }
}
