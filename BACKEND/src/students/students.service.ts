import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
	constructor(private readonly studentsRepo: StudentsRepository) {}

	async createStudent(dto: CreateStudentDto) {
		return this.studentsRepo.create({ 
            name: dto.name,
            dob: dto.dob ? new Date(dto.dob) : undefined,
            class_id: dto.class_id
        } as any);
	}

	async listAll(page = 1, pageSize = 20) {
		return this.studentsRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}
}
