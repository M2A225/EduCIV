import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimetablesService } from './timetables.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('timetables')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('DIRECTOR')
  async create(@Body() body: CreateTimetableDto) {
    const t = await this.timetablesService.create(body);
    return { success: true, data: t, error: null };
  }

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('class_id') class_id?: string,
    @Query('teacher_id') teacher_id?: string,
  ) {
    const timetables = await this.timetablesService.list(
      Number(page) || 1,
      Number(pageSize) || 100,
      class_id ? Number(class_id) : undefined,
      teacher_id ? Number(teacher_id) : undefined,
    );
    return { success: true, data: timetables, error: null };
  }
}
