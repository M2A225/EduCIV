import { Module } from '@nestjs/common';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [BulletinController],
  providers: [BulletinService],
  exports: [BulletinService],
})
export class BulletinModule {}
