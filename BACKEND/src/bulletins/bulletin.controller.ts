import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bulletins')
@UseGuards(JwtAuthGuard)
export class BulletinController {
  constructor(private readonly bulletinService: BulletinService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post(':studentId')
  async generateBulletin(
    @Param('studentId') studentId: string,
    @Body('periodId') periodId: number,
    @Body('year') year: string,
  ) {
    const url = await this.bulletinService.generateBulletin(
      Number(studentId),
      periodId,
      year,
    );
    return { success: true, data: { url }, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('batch/:classId')
  async generateBatchBulletins(
    @Param('classId') classId: string,
    @Body('periodId') periodId: number,
    @Body('year') year: string,
  ) {
    const urls = await this.bulletinService.generateBatchBulletins(
      Number(classId),
      periodId,
      year,
    );
    return { success: true, data: { urls, count: urls.length }, error: null };
  }
}
