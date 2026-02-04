import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

Injectable();
export class LaunchQueueHandler {
  constructor(@InjectQueue('demo') private readonly demoQueue: Queue) {}

  async execute() {
    await this.demoQueue.add('testingJob', { message: 'Hello World' });

    return {
      message: 'Job added to queue.',
    };
  }
}
