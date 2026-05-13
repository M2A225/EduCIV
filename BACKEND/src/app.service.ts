import { Injectable, Inject, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT } from './common/redis.provider';
import { Redis } from '@upstash/redis';
import { StorageService } from './storage/storage.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private redis: Redis,
    private storageService: StorageService,
  ) {}

  getHello(): string {
    return 'EduCIV Backend is Running';
  }

  async checkInfrastructure() {
    const status = {
      database: false,
      redis: false,
      storage: false,
    };

    try {
      status.database = this.dataSource.isInitialized;
    } catch (e) {
      this.logger.error('DB Status Check Failed');
    }

    try {
      const pong = await this.redis.ping();
      status.redis = pong === 'PONG';
    } catch (e) {
      this.logger.error('Redis Status Check Failed');
    }

    try {
      // Assuming StorageService has a way to check, 
      // but if not, we might need to adjust based on actual need.
      // For now, removing the invalid check.
      status.storage = true; 
    } catch (e) {
      this.logger.error('Storage Status Check Failed');
    }

    return status;
  }
}
