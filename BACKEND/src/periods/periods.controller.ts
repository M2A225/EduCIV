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
import { PeriodsService } from './periods.service';
import { CreatePeriodDto, UpdatePeriodDto } from './dto/create-period.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('periods')
@UseGuards(JwtAuthGuard)
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreatePeriodDto) {
    const data = await this.periodsService.create(body);
    return { success: true, data, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.periodsService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.periodsService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePeriodDto) {
    const data = await this.periodsService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.periodsService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
