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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles('DIRECTOR', 'BACKOFFICE')
  @HttpCode(HttpStatus.CREATED)
  @Post('bulk')
  async bulkCreate(
    @Body()
    body: {
      subjects: { name: string; coefficient: number; max_score?: number }[];
    },
  ) {
    const data = await this.subjectsService.bulkCreate(body.subjects);
    return { success: true, data, error: null };
  }

  @Roles('DIRECTOR', 'BACKOFFICE')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateSubjectDto) {
    const data = await this.subjectsService.create(body);
    return { success: true, data, error: null };
  }

  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.subjectsService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Roles('TEACHER', 'DIRECTOR', 'BACKOFFICE')
  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.subjectsService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Roles('DIRECTOR', 'BACKOFFICE')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSubjectDto) {
    const data = await this.subjectsService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @Roles('DIRECTOR', 'BACKOFFICE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.subjectsService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
