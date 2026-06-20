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
import { SchoolYearsService } from './school-years.service';
import {
  CreateSchoolYearDto,
  UpdateSchoolYearDto,
} from './dto/create-school-year.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('school-years')
@UseGuards(JwtAuthGuard)
export class SchoolYearsController {
  constructor(private readonly schoolYearsService: SchoolYearsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateSchoolYearDto) {
    const data = await this.schoolYearsService.create(body);
    return { success: true, data, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.schoolYearsService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.schoolYearsService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSchoolYearDto) {
    const data = await this.schoolYearsService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.schoolYearsService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
