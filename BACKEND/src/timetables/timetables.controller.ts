import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TimetablesService } from './timetables.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('timetables')
@UseGuards(JwtAuthGuard)
export class TimetablesController {
	constructor(private readonly timetablesService: TimetablesService) {}

	@Post()
	async create(@Body() body: CreateTimetableDto) {
		const t = await this.timetablesService.create(body);
		return { success: true, data: t, error: null };
	}

	@Get()
	async list(@Query() q: PaginationDto) {
		const timetables = await this.timetablesService.list(q.page, q.pageSize);
		return { success: true, data: timetables, error: null };
	}
}

