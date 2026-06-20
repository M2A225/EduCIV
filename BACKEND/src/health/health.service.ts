import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from '../common/redis.provider.js';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    postgres: { status: 'up' | 'down'; latencyMs: number };
    redis: { status: 'up' | 'down'; latencyMs: number };
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const status =
      postgres.status === 'up' && redis.status === 'up'
        ? 'healthy'
        : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: { postgres, redis },
    };
  }

  private async checkPostgres(): Promise<{
    status: 'up' | 'down';
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }

  private async checkRedis(): Promise<{
    status: 'up' | 'down';
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: 'up', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }
}
