import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		const user = await this.usersService.create(body);
		return { success: true, data: user, error: null };
	}

	@Get()
	async list(@Query() q: PaginationDto) {
		const users = await this.usersService.list(q.page, q.pageSize);
		return { success: true, data: users, error: null };
	}

	@Get(':id')
	async get(@Param('id') id: string) {
		const u = await this.usersService.findById(Number(id));
		return { success: true, data: u, error: null };
	}
}
