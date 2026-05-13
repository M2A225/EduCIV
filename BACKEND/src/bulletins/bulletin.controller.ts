import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { BulletinService } from './bulletin.service';

@Controller('bulletins')
export class BulletinController {
  constructor(private readonly bulletinService: BulletinService) {}

  @Get(':studentId/:trimester')
  async getBulletin(
    @Param('studentId') studentId: string,
    @Param('trimester') trimester: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const pdf = await this.bulletinService.generateBulletin(parseInt(studentId), parseInt(trimester));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=bulletin_${studentId}.pdf`,
      'Content-Length': pdf.length,
    });
    return pdf;
  }
}
