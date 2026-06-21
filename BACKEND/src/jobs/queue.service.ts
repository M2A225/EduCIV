import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BULL_QUEUE } from './queue.module';

@Injectable()
export class QueueService {
  constructor(@Inject(BULL_QUEUE) private readonly queue: Queue) {}

  add(
    name: string,
    data: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) {
    return this.queue.add(name, data, opts);
  }

  close() {
    return this.queue.close();
  }
}
