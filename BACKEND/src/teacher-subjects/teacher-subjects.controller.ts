import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeacherSubjectsService } from './teacher-subjects.service';
import { CreateTeacherSubjectDto } from './dto/create-teacher-subject.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../auth/types';

@Controller('teacher-subjects')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TeacherSubjectsController {
  constructor(private readonly service: TeacherSubjectsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('DIRECTOR', 'BACKOFFICE')
  async create(@Body() dto: CreateTeacherSubjectDto) {
    const data = await this.service.create(dto);
    return { success: true, data, error: null };
  }

  @Get()
  @Roles('DIRECTOR', 'BACKOFFICE')
  async list() {
    const data = await this.service.list();
    return { success: true, data, error: null };
  }

  @Get('by-teacher/:teacherId')
  @Roles('DIRECTOR', 'BACKOFFICE', 'TEACHER')
  async getByTeacher(@Param('teacherId') teacherId: string) {
    const data = await this.service.getByTeacher(Number(teacherId));
    return { success: true, data, error: null };
  }

  @Get('my-assignments')
  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  async getMyAssignments(@Req() req: RequestWithUser) {
    const userId = req.user?.userId;
    const data = await this.service.getMyAssignments(Number(userId));
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async remove(@Param('id') id: string) {
    await this.service.delete(Number(id));
    return { success: true, data: null, error: null };
  }
}
