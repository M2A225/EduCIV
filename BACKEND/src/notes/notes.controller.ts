import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ValidateGradeDto } from './dto/validate-grade.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestWithUser } from '../auth/types';

@Controller('notes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  async create(@Body() body: CreateGradeDto) {
    const data = await this.notesService.createGrade(body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('bulk')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  async bulkCreate(@Body() body: { grades: CreateGradeDto[] }) {
    const data = await this.notesService.bulkCreateGrades(body.grades);
    return { success: true, data, error: null };
  }

  @Get()
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE', 'PARENT')
  async list(@Query() q: PaginationDto) {
    const data = await this.notesService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get('pending')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async getPending(@Query('periodId') periodId?: string) {
    const data = await this.notesService.getPendingValidation(
      periodId ? Number(periodId) : undefined,
    );
    return { success: true, data, error: null };
  }

  @Get(':id')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE', 'PARENT')
  async getOne(@Param('id') id: string) {
    const data = await this.notesService.getGrade(Number(id));
    return { success: true, data, error: null };
  }

  @Get('student/:studentId')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE', 'PARENT')
  async getStudentGrades(
    @Param('studentId') studentId: string,
    @Query('periodId') periodId?: string,
  ) {
    const data = await this.notesService.getStudentGrades(
      Number(studentId),
      periodId ? Number(periodId) : undefined,
    );
    return { success: true, data, error: null };
  }

  @Get('class/:classId/period/:periodId')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  async getClassGrid(
    @Param('classId') classId: string,
    @Param('periodId') periodId: string,
  ) {
    const data = await this.notesService.getClassPeriodGrid(
      Number(classId),
      Number(periodId),
    );
    return { success: true, data, error: null };
  }

  @Patch(':id')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  async update(@Param('id') id: string, @Body() body: UpdateGradeDto) {
    const data = await this.notesService.updateGrade(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async remove(@Param('id') id: string) {
    const data = await this.notesService.deleteGrade(Number(id));
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/validate')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async validate(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user?.userId || req.user?.id;
    const data = await this.notesService.validateGrade(
      Number(id),
      Number(userId),
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/reject')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async reject(
    @Param('id') id: string,
    @Body() body: ValidateGradeDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.userId || req.user?.id;
    const data = await this.notesService.rejectGrade(
      Number(id),
      Number(userId),
      body.rejection_reason,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('report-card/:studentId')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async generateReportCard(
    @Param('studentId') studentId: string,
    @Body('periodId') periodId: number,
    @Body('year') year: string,
  ) {
    const data = await this.notesService.generateReportCard(
      Number(studentId),
      periodId,
      year,
    );
    return { success: true, data, error: null };
  }

  @Get('average/:studentId')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE', 'PARENT')
  async getAverage(
    @Param('studentId') studentId: string,
    @Query('periodId') periodId: string,
  ) {
    const data = await this.notesService.calculateAverage(
      Number(studentId),
      Number(periodId),
    );
    return { success: true, data, error: null };
  }
}
