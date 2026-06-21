import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolsRepository } from './schools.repository';
import { PrismaService } from '../core/prisma.service';
import { SchoolType } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly schoolsRepo: SchoolsRepository,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadSchoolLogo(schoolId: number, file: Express.Multer.File) {
    const path = `logos/school_${schoolId}.png`;

    await this.storage.uploadFile(
      'documents',
      path,
      file.buffer,
      file.mimetype,
    );
    const url = await this.storage.getPublicUrl('documents', path);

    return this.prisma.school.update({
      where: { id: schoolId },
      data: { logo_url: url },
    });
  }

  async createSchool(dto: CreateSchoolDto) {
    let school_id = dto.school_id;
    if (!school_id) {
      while (true) {
        school_id = Math.floor(100000 + Math.random() * 900000);
        const existing = await this.prisma.school.findUnique({
          where: { school_id },
        });
        if (!existing) break;
      }
    }
    return this.prisma.school.create({
      data: {
        name: dto.name,
        school_id,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        type: dto.type,
        school_type: dto.school_type as SchoolType,
        school_group_id: dto.school_group_id,
      },
    });
  }

  async listAll(page = 1, pageSize = 20) {
    return this.prisma.school.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
    });
  }

  async updateSchoolBySchoolId(schoolId: number, dto: UpdateSchoolDto) {
    return this.prisma.school.update({
      where: { school_id: schoolId },
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        type: dto.type,
        logo_url: dto.logo_url,
        school_type: dto.school_type as SchoolType,
        school_group_id: dto.school_group_id,
      },
    });
  }

  async updateSchool(id: number, dto: UpdateSchoolDto) {
    return this.prisma.school.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        type: dto.type,
        logo_url: dto.logo_url,
        school_type: dto.school_type as SchoolType,
        school_group_id: dto.school_group_id,
      },
    });
  }

  async deleteSchool(id: number) {
    return this.prisma.school.delete({ where: { id } });
  }

  async getStats(schoolId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalClasses,
      payments,
      totalAttendance,
      presentCount,
      unassignedStudents,
      unjustifiedAbsences,
      openIncidents,
      studentsWithPayments,
      allStudents,
    ] = await Promise.all([
      this.prisma.student.count({ where: { school_id: schoolId } }),
      this.prisma.class.count({ where: { school_id: schoolId } }),
      this.prisma.payment.aggregate({
        where: { school_id: schoolId, created_at: { gte: today } },
        _sum: { amount_fcfa: true },
      }),
      this.prisma.attendance.count({}),
      this.prisma.attendance.count({ where: { status: 'PRESENT' } }),
      this.prisma.student.count({
        where: { school_id: schoolId, is_affected: false },
      }),
      this.prisma.incident.count({
        where: {
          school_id: schoolId,
          type: 'ABSENCE_NON_JUSTIFIEE',
          status: 'EN_COURS',
        },
      }),
      this.prisma.incident.count({
        where: { school_id: schoolId, status: 'EN_COURS' },
      }),
      this.prisma.payment.findMany({
        where: { school_id: schoolId, status: 'VALIDE' },
        select: { student_id: true },
        distinct: ['student_id'],
      }),
      this.prisma.student.findMany({
        where: { school_id: schoolId },
        select: { id: true, name: true },
      }),
    ]);

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const alerts: string[] = [];
    const studentsWithPaymentIds = new Set(
      studentsWithPayments.map((p) => p.student_id),
    );
    const studentsWithoutPayments = allStudents.filter(
      (s) => !studentsWithPaymentIds.has(s.id),
    );

    if (unassignedStudents > 0)
      alerts.push(`${unassignedStudents} élève(s) non affecté(s) à une classe`);
    if (unjustifiedAbsences > 0)
      alerts.push(`${unjustifiedAbsences} absence(s) non justifiée(s)`);
    if (openIncidents > 0) alerts.push(`${openIncidents} incident(s) en cours`);
    if (studentsWithoutPayments.length > 0)
      alerts.push(`${studentsWithoutPayments.length} élève(s) sans paiement`);

    return {
      totalStudents,
      totalClasses,
      todayPayments: payments._sum.amount_fcfa || 0,
      attendanceRate,
      alerts,
    };
  }

  async getSchoolById(id: number) {
    return this.prisma.school.findUnique({ where: { id } });
  }

  async getSchoolBySchoolId(schoolId: number) {
    return this.prisma.school.findUnique({ where: { school_id: schoolId } });
  }

  async getFilieres(schoolId: number) {
    return this.prisma.schoolFiliere.findMany({
      where: { school_id: schoolId },
      select: { filiere: true },
    });
  }

  async updateFilieres(schoolId: number, filieres: string[]) {
    await this.prisma.schoolFiliere.deleteMany({
      where: { school_id: schoolId },
    });
    if (filieres.length > 0) {
      await this.prisma.schoolFiliere.createMany({
        data: filieres.map((f) => ({ school_id: schoolId, filiere: f })),
      });
    }
    return filieres;
  }

  async getSetupStatus(schoolId: number, role: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        director_setup_at: true,
        accountant_setup_at: true,
        setup_completed_at: true,
      },
    });

    const director_completed = !!school?.director_setup_at;
    const accountant_completed = !!school?.accountant_setup_at;
    const completed = !!school?.setup_completed_at;
    const wizard_steps = role === 'DIRECTOR' ? 6 : 2;

    return {
      completed,
      completed_at: school?.setup_completed_at,
      director_completed,
      accountant_completed,
      wizard_steps,
      current_step: 0,
    };
  }

  getDefaultLevels(schoolType: string): string[] {
    switch (schoolType) {
      case 'PRIMAIRE':
        return ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
      case 'SECONDAIRE':
        return ['6e', '5e', '4e', '3e', '2nde', '1ere', 'Tle'];
      case 'LYCEE_TECHNIQUE':
        return ['2nde', '1ere', 'Tle'];
      case 'LYCEE_PROFESSIONNEL':
        return ['2nde', '1ere', 'Tle'];
      case 'GROUPE_SCOLAIRE':
        return [
          'CP1',
          'CP2',
          'CE1',
          'CE2',
          'CM1',
          'CM2',
          '6e',
          '5e',
          '4e',
          '3e',
          '2nde',
          '1ere',
          'Tle',
        ];
      default:
        return [
          'CP1',
          'CP2',
          'CE1',
          'CE2',
          'CM1',
          'CM2',
          '6e',
          '5e',
          '4e',
          '3e',
          '2nde',
          '1ere',
          'Tle',
        ];
    }
  }

  async getLevels(schoolId: number) {
    return this.prisma.schoolLevel.findMany({
      where: { school_id: schoolId },
      select: { id: true, level: true },
      orderBy: { level: 'asc' },
    });
  }

  async updateLevels(schoolId: number, levels: string[]) {
    await this.prisma.schoolLevel.deleteMany({
      where: { school_id: schoolId },
    });
    if (levels.length > 0) {
      await this.prisma.schoolLevel.createMany({
        data: levels.map((level) => ({ school_id: schoolId, level })),
      });
    }
    return this.getLevels(schoolId);
  }

  async completeSetup(schoolId: number, role: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { director_setup_at: true, accountant_setup_at: true },
    });

    const now = new Date();
    const data: Record<string, Date | null> = {};

    if (role === 'DIRECTOR') {
      data.director_setup_at = now;
      if (school?.accountant_setup_at) {
        data.setup_completed_at = now;
      }
    } else if (role === 'ACCOUNTANT') {
      data.accountant_setup_at = now;
      if (school?.director_setup_at) {
        data.setup_completed_at = now;
      }
    }

    return this.prisma.school.update({
      where: { id: schoolId },
      data,
      select: {
        director_setup_at: true,
        accountant_setup_at: true,
        setup_completed_at: true,
      },
    });
  }

  async getLevelTuitions(schoolId: number) {
    return this.prisma.levelTuition.findMany({
      where: { school_id: schoolId },
      select: { id: true, level: true, amount: true },
      orderBy: { level: 'asc' },
    });
  }

  async upsertLevelTuitions(
    schoolId: number,
    tuitions: { level: string; amount: number }[],
  ) {
    await this.prisma.levelTuition.deleteMany({
      where: { school_id: schoolId },
    });
    if (tuitions.length > 0) {
      await this.prisma.levelTuition.createMany({
        data: tuitions.map((t) => ({
          school_id: schoolId,
          level: t.level,
          amount: t.amount,
        })),
      });
    }
    return this.getLevelTuitions(schoolId);
  }

  async resetSetup(schoolId: number) {
    await this.prisma.schoolLevel.deleteMany({
      where: { school_id: schoolId },
    });
    await this.prisma.levelTuition.deleteMany({
      where: { school_id: schoolId },
    });
    return this.prisma.school.update({
      where: { id: schoolId },
      data: {
        director_setup_at: null,
        accountant_setup_at: null,
        setup_completed_at: null,
      },
      select: {
        id: true,
        director_setup_at: true,
        accountant_setup_at: true,
        setup_completed_at: true,
      },
    });
  }

  async getSchoolGroup(schoolId: number) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });
    if (!school?.school_group_id) return null;
    return this.prisma.schoolGroup.findUnique({
      where: { id: school.school_group_id },
      include: {
        schools: { select: { id: true, name: true, school_type: true } },
      },
    });
  }
}
