import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolsRepository } from './schools.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class SchoolsService {
	constructor(
        private readonly schoolsRepo: SchoolsRepository,
        private readonly prisma: PrismaService
    ) {}

	async createSchool(dto: CreateSchoolDto) {
		return this.schoolsRepo.create({ name: dto.name, school_id: dto.school_id });
	}

	async listAll(page = 1, pageSize = 20) {
		return this.schoolsRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}

    async getStats(schoolId: number) {
        const totalStudents = await this.prisma.student.count({ where: { school_id: schoolId } });
        const totalClasses = await this.prisma.timetable.groupBy({
            by: ['class_id'],
            where: { school_id: schoolId }
        });
        
        const today = new Date().toISOString().split('T')[0];
        const payments = await this.prisma.payment.aggregate({
            where: { school_id: schoolId, created_at: { gte: new Date(today) } },
            _sum: { amount_fcfa: true }
        });

        return {
            totalStudents,
            totalClasses: totalClasses.length,
            todayPayments: payments._sum.amount_fcfa || 0,
            attendanceRate: 95, // À calculer dynamiquement plus tard
            alerts: []
        };
    }
}
