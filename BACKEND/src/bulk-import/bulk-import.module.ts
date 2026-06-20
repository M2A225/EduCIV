import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from './bulk-import.service';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    InvitationsModule,
  ],
  controllers: [BulkImportController],
  providers: [BulkImportService],
})
export class BulkImportModule {}
