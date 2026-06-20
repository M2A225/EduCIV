import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BulkImportService, ImportResult } from './bulk-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolContextGuard } from '../auth/guards/school-context.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bulk-import')
@UseGuards(JwtAuthGuard, SchoolContextGuard, PermissionGuard)
@Roles('DIRECTOR')
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Get('template/:type')
  async downloadTemplate(@Param('type') type: string, @Res() res: Response) {
    const wb = await this.bulkImportService.generateTemplate(type);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=template_${type}.xlsx`,
    );
    await wb.xlsx.write(res);
    res.end();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('students')
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) return { success: false, data: null, error: 'Fichier requis' };
    const result: ImportResult = await this.bulkImportService.importStudents(
      file.buffer,
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data: result, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('teachers')
  @UseInterceptors(FileInterceptor('file'))
  async importTeachers(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) return { success: false, data: null, error: 'Fichier requis' };
    const result: ImportResult = await this.bulkImportService.importTeachers(
      file.buffer,
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data: result, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('parents')
  @UseInterceptors(FileInterceptor('file'))
  async importParents(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) return { success: false, data: null, error: 'Fichier requis' };
    const result: ImportResult = await this.bulkImportService.importParents(
      file.buffer,
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data: result, error: null };
  }
}
