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
import { IncidentsService } from './incidents.service';
import {
  CreateIncidentDto,
  UpdateIncidentDto,
} from './dto/create-incident.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateIncidentDto) {
    const data = await this.incidentsService.create(body);
    return { success: true, data, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const data = await this.incidentsService.list(q.page, q.pageSize);
    return { success: true, data, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.incidentsService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateIncidentDto) {
    const data = await this.incidentsService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.incidentsService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
