import { Injectable, Inject, Logger } from '@nestjs/common';
import { REDIS_CLIENT } from './common/redis.provider';
import { Redis } from '@upstash/redis';
import { PrismaService } from './core/prisma.service';
import { StorageService } from './storage/storage.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  getHello(): string {
    return 'EduCIV Backend is Running';
  }

  async checkInfrastructure() {
    const [dbOk, redisOk, storageOk] = await Promise.allSettled([
      (async () => {
        await this.prisma.$executeRawUnsafe('SELECT 1');
        return true;
      })(),
      (async () => {
        const pong = await this.redis.ping();
        return pong === 'PONG';
      })(),
      (async () => {
        const { data } = await this.storageService.listBuckets();
        return !!data;
      })(),
    ]);

    const status = {
      database: dbOk.status === 'fulfilled' && dbOk.value,
      redis: redisOk.status === 'fulfilled' && redisOk.value,
      storage: storageOk.status === 'fulfilled' && storageOk.value,
    };

    if (dbOk.status === 'rejected')
      this.logger.error(
        'Database health check failed',
        dbOk.reason instanceof Error ? dbOk.reason.message : dbOk.reason,
      );
    if (redisOk.status === 'rejected')
      this.logger.error(
        'Redis health check failed',
        redisOk.reason instanceof Error
          ? redisOk.reason.message
          : redisOk.reason,
      );
    if (storageOk.status === 'rejected')
      this.logger.error(
        'Storage health check failed',
        storageOk.reason instanceof Error
          ? storageOk.reason.message
          : storageOk.reason,
      );

    return status;
  }
}
