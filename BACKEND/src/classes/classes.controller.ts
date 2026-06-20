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
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/create-class.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateClassDto) {
    const data = await this.classesService.create(body);
    return { success: true, data, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.classesService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.classesService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateClassDto) {
    const data = await this.classesService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.classesService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
