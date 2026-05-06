import { Provider } from '@nestjs/common';
import { Redis } from '@upstash/redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error('REDIS_URL and UPSTASH_REDIS_REST_TOKEN must be defined');
    }
    return new Redis({
      url,
      token,
    });
  },
};
