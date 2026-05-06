import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolsRepository } from './schools.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { School } from '../entities/school.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchoolsService {
	constructor(
		private readonly schoolsRepo: SchoolsRepository,
		@InjectRepository(School)
		private readonly rawRepo: Repository<School>,
	) {}

	async createSchool(dto: CreateSchoolDto) {
		// Creation is a special case: it doesn't have a school_id in JWT yet.
		// We use the raw repository to avoid BaseRepository's tenant check.
		const s = this.rawRepo.create({ name: dto.name, school_id: dto.school_id });
		return this.rawRepo.save(s);
	}

	async listAll(page = 1, pageSize = 20) {
		return this.schoolsRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}
}
