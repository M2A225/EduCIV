import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
	constructor(private readonly schoolsService: SchoolsService) {}

	@Post()
	async create(@Body() body: CreateSchoolDto) {
		const s = await this.schoolsService.createSchool(body);
		return { success: true, data: s, error: null };
	}

	@Get()
	async list(@Query() q: PaginationDto) {
		const schools = await this.schoolsService.listAll(q.page, q.pageSize);
		return { success: true, data: schools, error: null };
	}
}

