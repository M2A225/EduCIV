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
import { RequestWithUser } from '../auth/types';
import { SyncOperationInput } from './sync.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('push')
  async sync(
    @Body() body: { operations: SyncOperationInput[] },
    @Req() req: RequestWithUser,
  ) {
    const schoolId = getCurrentSchoolId(req);
    return {
      success: true,
      data: await this.syncService.processOperations(schoolId, body.operations),
      error: null,
    };
  }

  @Get('pull')
  async pull(@Req() req: RequestWithUser, @Query('since') since?: string) {
    const schoolId = getCurrentSchoolId(req);
    return {
      success: true,
      data: await this.syncService.pullData(schoolId, since),
      error: null,
    };
  }
}
