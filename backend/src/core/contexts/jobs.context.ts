import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/**
 * Shared helper for sandboxed BullMQ job processors.
 *
 * A sandboxed job runs in a forked Node process — it has no access to the
 * NestJS DI container that the API uses. This file handles two concerns:
 *
 *   1. `sandboxedProcessors(...)` — used inside `BullModule.registerQueue` so
 *      workers are registered only in the main process, never in a child.
 *   2. `getJobContext()` / `closeJobContext()` — bootstraps and memoizes a
 *      standalone NestJS context per child, giving jobs DI access to shared
 *      services (Prisma, S3, Ffmpeg, Config, ...).
 */

// ----------------------------------------------------------------------------
// Sandbox detection
// ----------------------------------------------------------------------------

const SANDBOX_ENV = 'BULLMQ_SANDBOX_CHILD';

const isSandboxChild = (): boolean => process.env[SANDBOX_ENV] === '1';

/**
 * Wrap a BullMQ processors array so it resolves to `undefined` inside a
 * sandboxed child. Without this, every child would re-register its own
 * worker on the same queue and multiply effective concurrency.
 *
 *   BullModule.registerQueue({
 *     name: 'media',
 *     processors: sandboxedProcessors({ path: ..., concurrency: 1 }),
 *   })
 */
export const sandboxedProcessors = <T>(...processors: T[]): T[] | undefined => {
  return isSandboxChild() ? undefined : processors;
};

// ----------------------------------------------------------------------------
// Child app context
// ----------------------------------------------------------------------------

let cachedContext: INestApplicationContext | null = null;
let bootstrapPromise: Promise<INestApplicationContext> | null = null;

export async function getJobContext(): Promise<INestApplicationContext> {
  if (cachedContext) {
    return cachedContext;
  }

  // Guard against concurrent jobs triggering two parallel bootstraps
  if (!bootstrapPromise) {
    // Mark the child before `AppModule` is imported so `sandboxedProcessors`
    // can skip worker registration during module evaluation.
    process.env[SANDBOX_ENV] = '1';

    bootstrapPromise = (async () => {
      const { AppModule } = await import('../../app.module.js');

      return NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
        abortOnError: false,
      });
    })();
  }

  cachedContext = await bootstrapPromise;

  return cachedContext;
}

/**
 * Close the cached NestJS context. BullMQ calls this automatically when the
 * sandboxed worker exits — wire it up at the bottom of your processor file:
 *
 *   process.on('SIGTERM', closeJobContext);
 *   process.on('SIGINT', closeJobContext);
 */
export async function closeJobContext(): Promise<void> {
  if (cachedContext) {
    await cachedContext.close();
    cachedContext = null;
    bootstrapPromise = null;
  }
}
