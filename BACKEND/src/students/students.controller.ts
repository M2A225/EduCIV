import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
	constructor(private readonly studentsService: StudentsService) {}

	@Post()
	async create(@Body() body: CreateStudentDto) {
		const s = await this.studentsService.createStudent(body);
		return { success: true, data: s, error: null };
	}

	@Get()
	async list(@Query() q: PaginationDto) {
		const students = await this.studentsService.listAll(q.page, q.pageSize);
		return { success: true, data: students, error: null };
	}
}
