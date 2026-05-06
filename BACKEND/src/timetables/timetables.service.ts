import { Injectable, ConflictException } from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { TimetablesRepository } from './timetables.repository';

@Injectable()
export class TimetablesService {
	constructor(private readonly timetablesRepo: TimetablesRepository) {}

	async create(dto: CreateTimetableDto) {
		const conflict = await this.timetablesRepo.findOne({ where: { slot: dto.slot } as any });
		if (conflict && (conflict.teacher_id === dto.teacher_id || conflict.class_id === dto.class_id)) {
			throw new ConflictException('Timetable conflict');
		}
		return this.timetablesRepo.create(dto);
	}

	async list(page = 1, pageSize = 20) {
		return this.timetablesRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}
}
