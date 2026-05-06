import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BULL_QUEUE } from './queue.module';

@Injectable()
export class QueueService {
  constructor(@Inject(BULL_QUEUE) private readonly queue: Queue) {}

  async add(name: string, data: any, opts?: any) {
    return this.queue.add(name, data, opts);
  }

  async close() {
    return this.queue.close();
  }
}
