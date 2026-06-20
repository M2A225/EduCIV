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
  UseGuards,
} from '@nestjs/common';
import { SchoolGroupsService } from './school-groups.service';
import { CreateSchoolGroupDto } from './dto/create-school-group.dto';
import { UpdateSchoolGroupDto } from './dto/update-school-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('school-groups')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('BACKOFFICE')
export class SchoolGroupsController {
  constructor(private readonly schoolGroupsService: SchoolGroupsService) {}

  @Get()
  async list() {
    const data = await this.schoolGroupsService.list();
    return { success: true, data, error: null };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.schoolGroupsService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateSchoolGroupDto) {
    const data = await this.schoolGroupsService.create(body);
    return { success: true, data, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSchoolGroupDto) {
    const data = await this.schoolGroupsService.update(Number(id), body);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.schoolGroupsService.delete(Number(id));
    return { success: true, data: null, error: null };
  }

  @Get('available-schools/all')
  async getAvailableSchools() {
    const data = await this.schoolGroupsService.getAvailableSchools();
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/schools')
  async addSchool(@Param('id') id: string, @Body('schoolId') schoolId: number) {
    const data = await this.schoolGroupsService.addSchool(
      Number(id),
      Number(schoolId),
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/schools/:schoolId')
  async removeSchool(
    @Param('id') id: string,
    @Param('schoolId') schoolId: string,
  ) {
    const data = await this.schoolGroupsService.removeSchool(
      Number(id),
      Number(schoolId),
    );
    return { success: true, data, error: null };
  }
}
