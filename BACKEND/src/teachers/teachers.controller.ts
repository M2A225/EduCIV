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
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/create-teacher.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateTeacherDto) {
    const data = await this.teachersService.create(body);
    return { success: true, data, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.teachersService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.teachersService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTeacherDto) {
    const data = await this.teachersService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.teachersService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
