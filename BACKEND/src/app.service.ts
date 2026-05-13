import { Injectable, Inject, Logger } from '@nestjs/common';
import { REDIS_CLIENT } from './common/redis.provider';
import { Redis } from '@upstash/redis';
import { StorageService } from './storage/storage.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private storageService: StorageService,
  ) {}

  getHello(): string {
    return 'EduCIV Backend is Running';
  }

  async checkInfrastructure() {
    const status = {
      database: true,
      redis: false,
      storage: false,
    };

    try {
      const pong = await this.redis.ping();
      status.redis = pong === 'PONG';
    } catch (e) {
      this.logger.error('Redis Status Check Failed');
    }

    try {
      status.storage = true; 
    } catch (e) {
      this.logger.error('Storage Status Check Failed');
    }

    return status;
  }
}
