import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestWithUser } from '../auth/types';

@Controller('students')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('DIRECTOR', 'BACKOFFICE')
  async create(@Body() body: CreateStudentDto) {
    const s = await this.studentsService.createStudent(body);
    return { success: true, data: s, error: null };
  }

  @Get('me')
  @Roles(
    'DIRECTOR',
    'BACKOFFICE',
    'TEACHER',
    'EDUCATOR',
    'PARENT',
    'CASHIER',
    'ACCOUNTANT',
  )
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user?.userId;
    if (!userId) {
      return { success: false, data: null, error: 'Unauthorized' };
    }
    const s = await this.studentsService.getByUserId(userId);
    return { success: true, data: s, error: null };
  }

  @Get()
  @Roles(
    'DIRECTOR',
    'BACKOFFICE',
    'TEACHER',
    'EDUCATOR',
    'CASHIER',
    'ACCOUNTANT',
  )
  async list(@Query() q: PaginationDto) {
    const students = await this.studentsService.listAll(q.page, q.pageSize);
    return { success: true, data: students, error: null };
  }

  @Get(':id')
  @Roles(
    'DIRECTOR',
    'BACKOFFICE',
    'TEACHER',
    'EDUCATOR',
    'CASHIER',
    'ACCOUNTANT',
    'PARENT',
  )
  async get(@Param('id') id: string) {
    const s = await this.studentsService.getById(Number(id));
    return { success: true, data: s, error: null };
  }

  @Patch(':id')
  @Roles('DIRECTOR', 'BACKOFFICE')
  async update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    const s = await this.studentsService.update(Number(id), body);
    return { success: true, data: s, error: null };
  }
}
