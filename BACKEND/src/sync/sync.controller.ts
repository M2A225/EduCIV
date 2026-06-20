import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getCurrentSchoolId } from '../common/school-context';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('push')
  async sync(@Body() body: { operations: any[] }, @Req() req: any) {
    const schoolId = getCurrentSchoolId(req);
    return {
      success: true,
      data: await this.syncService.processOperations(schoolId, body.operations),
      error: null,
    };
  }

  @Get('pull')
  async pull(@Req() req: any, @Query('since') since?: string) {
    const schoolId = getCurrentSchoolId(req);
    return {
      success: true,
      data: await this.syncService.pullData(schoolId, since),
      error: null,
    };
  }
}
