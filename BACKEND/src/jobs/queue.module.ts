import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';

const BULL_QUEUE = 'BULL_QUEUE';

@Global()
@Module({
  providers: [
    {
      provide: BULL_QUEUE,
      useFactory: () => {
        const host = process.env.UPSTASH_REDIS_HOST;
        if (!host) throw new Error('UPSTASH_REDIS_HOST is not defined');

        const port = parseInt(process.env.UPSTASH_REDIS_PORT || '6379', 10);
        const password = process.env.UPSTASH_REDIS_PASSWORD;
        if (!password) throw new Error('UPSTASH_REDIS_PASSWORD is not defined');

        const connection = {
          host,
          port,
          password,
          tls: {},
        };

        const queueName = process.env.QUEUE_NAME || 'default';
        return new Queue(queueName, { connection });
      },
    },
  ],
  exports: [BULL_QUEUE],
})
export class QueueModule {}

export { BULL_QUEUE };
