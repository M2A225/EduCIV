import { Injectable, Inject, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT } from './common/redis.provider';
import { Redis } from '@upstash/redis';
import { R2Service } from './storage/r2.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private redis: Redis,
    private r2Service: R2Service,
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
      status.storage = await this.r2Service.checkConnection();
    } catch (e) {
      this.logger.error('Storage Status Check Failed');
    }

    return status;
  }
}
