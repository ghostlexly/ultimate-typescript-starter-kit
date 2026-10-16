import { Injectable } from '@nestjs/common';
import cluster from 'node:cluster';

@Injectable()
export class AppService {
  getHello(): string {
    const clusterId = cluster.isPrimary
      ? 'Primary'
      : `Worker Id: ${cluster.worker?.id}`;

    return `Hello World! : ${clusterId}`;
  }
}
