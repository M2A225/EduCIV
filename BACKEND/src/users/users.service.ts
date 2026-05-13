import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
	constructor(private readonly usersRepo: UsersRepository) {}

	async create(dto: CreateUserDto) {
		const hashed = await bcrypt.hash(dto.password, 10);
		return this.usersRepo.create({ email: dto.email, password: hashed, school_id: dto.school_id });
	}

	async findByEmail(email: string) {
		return this.usersRepo.findByEmailGlobal(email);
	}

	async findById(id: number) {
		return this.usersRepo.findOne({ where: { id } as any });
	}

	async list(page = 1, pageSize = 20) {
		return this.usersRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}

	async verifyPassword(user: any, password: string) {
		return bcrypt.compare(password, user.password);
	}
}
