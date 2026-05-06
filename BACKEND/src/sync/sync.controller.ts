import { Controller, Post, Body, Req } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  async sync(@Body() body: { operations: any[] }, @Req() req: any) {
    // Supposons que le school_id est extrait du JWT par un guard
    const schoolId = req.user?.school_id || 'default-school';
    return this.syncService.processOperations(schoolId, body.operations);
  }
}
