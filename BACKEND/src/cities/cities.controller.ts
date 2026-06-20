import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll() {
    const data = await this.citiesService.findAll();
    return { success: true, data, error: null };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.citiesService.getById(Number(id));
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: { name: string }) {
    const data = await this.citiesService.create(body.name);
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    const data = await this.citiesService.update(Number(id), body.name);
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.citiesService.delete(Number(id));
    return { success: true, data: null, error: null };
  }

  @Get(':id/communes')
  async getCommunes(@Param('id') id: string) {
    const data = await this.citiesService.getCommunes(Number(id));
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/communes')
  async createCommune(@Param('id') id: string, @Body() body: { name: string }) {
    const data = await this.citiesService.createCommune(Number(id), body.name);
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @Patch('communes/:id')
  async updateCommune(@Param('id') id: string, @Body() body: { name: string }) {
    const data = await this.citiesService.updateCommune(Number(id), body.name);
    return { success: true, data, error: null };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('communes/:id')
  async removeCommune(@Param('id') id: string) {
    await this.citiesService.deleteCommune(Number(id));
    return { success: true, data: null, error: null };
  }
}
