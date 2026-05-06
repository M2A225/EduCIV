import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { redisProvider } from '../common/redis.provider';

const BULL_QUEUE = 'BULL_QUEUE';

@Global()
@Module({
  providers: [
    redisProvider,
    {
      provide: BULL_QUEUE,
      useFactory: () => {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        if (!url) throw new Error('REDIS_URL is not defined');

        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');

        // BullMQ requires ioredis. Upstash Redis URL is compatible with ioredis.
        const connection = new Redis(url, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          password: token,
        });

        const queueName = process.env.QUEUE_NAME || 'default';
        return new Queue(queueName, { connection });
      },
    },
  ],
  exports: [BULL_QUEUE, redisProvider],
})
export class QueueModule {}

export { BULL_QUEUE };
