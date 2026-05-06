import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './sync.repository';
import { SyncOperation } from '../entities/sync_operation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncOperation])],
  controllers: [SyncController],
  providers: [SyncService, SyncRepository],
  exports: [SyncService],
})
export class SyncModule {}
