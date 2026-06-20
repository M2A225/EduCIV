import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { NotesRepository } from './notes.repository';
import { ReportCardsRepository } from './report-cards.repository';
import { PrismaService } from '../core/prisma.service';
import { GradeType } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepo: NotesRepository,
    private readonly reportCardsRepo: ReportCardsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createGrade(dto: CreateGradeDto) {
    return this.notesRepo.create({
      value: dto.value,
      type: dto.type,
      comment: dto.comment,
      max_score: dto.max_score,
      status: dto.status || 'EN_ATTENTE',
      period_id: dto.period_id,
      student_id: dto.student_id,
      subject_id: dto.subject_id,
    });
  }

  async updateGrade(id: number, dto: UpdateGradeDto) {
    const grade = await this.notesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');
    return this.notesRepo.update(id, dto);
  }

  async deleteGrade(id: number) {
    const grade = await this.notesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');
    return this.notesRepo.delete(id);
  }

  async getGrade(id: number) {
    const grade = await this.notesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');
    return grade;
  }

  async getStudentGrades(studentId: number, periodId?: number) {
    const where: any = { student_id: studentId };
    if (periodId) where.period_id = periodId;
    return this.notesRepo.findMany({
      where,
      include: { subject: true, period: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async list(page = 1, pageSize = 20) {
    return this.notesRepo.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { subject: true, student: true, period: true },
      orderBy: { created_at: 'desc' },
    });
  }

  // Récupère la grille complète pour une classe + période (primaire)
  async getClassPeriodGrid(classId: number, periodId: number) {
    const schoolId = this.notesRepo.currentSchoolId!;

    const students = await this.notesRepo.prisma.student.findMany({
      where: { class_id: classId, school_id: schoolId },
      orderBy: { name: 'asc' },
    });

    const subjects = await this.notesRepo.prisma.subject.findMany({
      where: { school_id: schoolId },
      orderBy: { name: 'asc' },
    });

    const grades = await this.notesRepo.prisma.grade.findMany({
      where: {
        student_id: { in: students.map((s) => s.id) },
        period_id: periodId,
        school_id: schoolId,
      },
    });

    const cls = await this.notesRepo.prisma.class.findUnique({
      where: { id: classId },
      select: { grade_total_max: true, grade_avg_scale: true },
    });

    // Index grades by student_id + subject_id
    const gradeMap = new Map<string, any>();
    for (const g of grades) {
      gradeMap.set(`${g.student_id}-${g.subject_id}`, g);
    }

    return {
      students,
      subjects,
      grades: Object.fromEntries(gradeMap),
      classConfig: cls || null,
    };
  }

  // Sauvegarde multiple de notes (primaire)
  async bulkCreateGrades(
    grades: {
      student_id: number;
      subject_id: number;
      value: number;
      max_score?: number;
      comment?: string;
      period_id: number;
      type: GradeType;
    }[],
  ) {
    const schoolId = this.notesRepo.currentSchoolId!;
    if (grades.length === 0) return [];

    return this.prisma.$transaction(async (tx) => {
      const existingGrades = await tx.grade.findMany({
        where: {
          OR: grades.map((g) => ({
            student_id: g.student_id,
            subject_id: g.subject_id,
            period_id: g.period_id,
            school_id: schoolId,
          })),
        },
        select: {
          id: true,
          student_id: true,
          subject_id: true,
          period_id: true,
        },
      });

      const existingKey = new Map(
        existingGrades.map((eg) => [
          `${eg.student_id}-${eg.subject_id}-${eg.period_id}`,
          eg.id,
        ]),
      );

      const toUpdate: {
        id: number;
        value: number;
        max_score?: number;
        comment?: string;
      }[] = [];
      const toCreate: {
        value: number;
        type: GradeType;
        comment?: string;
        max_score?: number;
        period_id: number;
        student_id: number;
        subject_id: number;
        school_id: number;
      }[] = [];

      for (const g of grades) {
        const key = `${g.student_id}-${g.subject_id}-${g.period_id}`;
        const existingId = existingKey.get(key);
        if (existingId) {
          toUpdate.push({
            id: existingId,
            value: g.value,
            max_score: g.max_score,
            comment: g.comment,
          });
        } else {
          toCreate.push({
            value: g.value,
            type: g.type,
            comment: g.comment,
            max_score: g.max_score,
            period_id: g.period_id,
            student_id: g.student_id,
            subject_id: g.subject_id,
            school_id: schoolId,
          });
        }
      }

      const results: any[] = [];
      for (const u of toUpdate) {
        results.push(
          await tx.grade.update({
            where: { id: u.id },
            data: {
              value: u.value,
              max_score: u.max_score,
              comment: u.comment,
            },
          }),
        );
      }
      if (toCreate.length > 0) {
        await tx.grade.createMany({ data: toCreate });
      }
      return results;
    });
  }

  async validateGrade(id: number, userId: number) {
    const grade = await this.notesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');
    if (grade.status !== 'EN_ATTENTE')
      throw new ForbiddenException(
        'Seules les notes en attente peuvent être validées',
      );

    return this.notesRepo.update(id, {
      status: 'VALIDE',
      validated_by: userId,
      validated_at: new Date(),
    });
  }

  async rejectGrade(id: number, userId: number, reason?: string) {
    const grade = await this.notesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');
    if (grade.status !== 'EN_ATTENTE')
      throw new ForbiddenException(
        'Seules les notes en attente peuvent être rejetées',
      );

    return this.notesRepo.update(id, {
      status: 'REJETE',
      validated_by: userId,
      validated_at: new Date(),
      rejection_reason: reason || null,
    });
  }

  async validateGrades(ids: number[], schoolId: number) {
    const result = await this.prisma.grade.updateMany({
      where: {
        id: { in: ids },
        school_id: schoolId,
        status: 'EN_ATTENTE',
      },
      data: { status: 'VALIDE' },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'Aucune note en attente trouvée avec les IDs fournis',
      );
    }
    return { validated: result.count };
  }

  async rejectGrades(ids: number[], schoolId: number) {
    const result = await this.prisma.grade.updateMany({
      where: {
        id: { in: ids },
        school_id: schoolId,
        status: 'EN_ATTENTE',
      },
      data: { status: 'REJETE' },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'Aucune note en attente trouvée avec les IDs fournis',
      );
    }
    return { rejected: result.count };
  }

  async getPendingValidation(periodId?: number) {
    const where: any = { status: 'EN_ATTENTE' };
    if (periodId) where.period_id = periodId;
    return this.notesRepo.find({
      where,
      include: { subject: true, student: true, period: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async calculateAverage(studentId: number, periodId: number) {
    const grades = await this.notesRepo.getStudentGrades(studentId, periodId);
    if (grades.length === 0) return null;

    // Détection primaire : si les notes ont un max_score, on utilise le calcul primaire
    const hasMaxScore = grades.some((g) => g.max_score != null);
    if (hasMaxScore) {
      const total = grades.reduce((sum, g) => sum + g.value, 0);
      // Trouver le grade_total_max de la classe
      const student = await this.notesRepo.prisma.student.findUnique({
        where: { id: studentId },
        select: { class_id: true },
      });
      const cls = student?.class_id
        ? await this.notesRepo.prisma.class.findUnique({
            where: { id: student.class_id },
            select: { grade_total_max: true },
          })
        : null;
      const gradeTotalMax = cls?.grade_total_max || 0;
      const generalAverage = gradeTotalMax > 0 ? total / gradeTotalMax : 0;
      const avgScale =
        generalAverage <= 1 ? generalAverage * 10 : generalAverage;
      return {
        generalAverage,
        totalPoints: total,
        totalCoef: gradeTotalMax,
        avgScale,
      };
    }

    // Calcul secondaire (coefficients)
    const subjectIds = [...new Set(grades.map((g) => g.subject_id))];
    const subjects = await this.notesRepo.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, coefficient: true },
    });
    const coefMap = new Map(subjects.map((s) => [s.id, s.coefficient]));

    const subjectAverages = new Map<
      number,
      { sum: number; count: number; coef: number }
    >();

    grades.forEach((grade) => {
      const subjectId = grade.subject_id;
      const coef = coefMap.get(subjectId) || 1;
      const current = subjectAverages.get(subjectId) || {
        sum: 0,
        count: 0,
        coef,
      };
      current.sum += grade.value;
      current.count += 1;
      subjectAverages.set(subjectId, current);
    });

    let totalPoints = 0;
    let totalCoef = 0;

    subjectAverages.forEach((data) => {
      const subjectAvg = data.sum / data.count;
      totalPoints += subjectAvg * data.coef;
      totalCoef += data.coef;
    });

    const generalAverage = totalCoef > 0 ? totalPoints / totalCoef : 0;

    return { generalAverage, totalPoints, totalCoef };
  }

  private async computeStudentRank(
    studentId: number,
    periodId: number,
  ): Promise<{ rank: number; average: number }> {
    const student = await this.notesRepo.prisma.student.findUnique({
      where: { id: studentId },
      select: { class_id: true },
    });
    if (!student?.class_id) return { rank: 1, average: 0 };

    // Vérifier si c'est une classe primaire
    const cls = await this.notesRepo.prisma.class.findUnique({
      where: { id: student.class_id },
      select: { grade_total_max: true },
    });
    const isPrimary = cls?.grade_total_max != null && cls.grade_total_max > 0;

    const classStudentIds = await this.notesRepo.prisma.student.findMany({
      where: { class_id: student.class_id },
      select: { id: true },
    });
    const ids = classStudentIds.map((s) => s.id);

    const allGrades = await this.notesRepo.prisma.grade.findMany({
      where: { student_id: { in: ids }, period_id: periodId },
      select: {
        student_id: true,
        subject_id: true,
        value: true,
        max_score: true,
      },
    });

    const subjectCoefs = isPrimary
      ? null
      : await this.notesRepo.prisma.subject.findMany({
          where: { school_id: (this.notesRepo as any).schoolId },
          select: { id: true, coefficient: true },
        });
    const coefMap = subjectCoefs
      ? new Map(subjectCoefs.map((s) => [s.id, s.coefficient]))
      : null;

    const studentAverages = new Map<number, number>();

    for (const sId of ids) {
      const sGrades = allGrades.filter((g) => g.student_id === sId);
      if (sGrades.length === 0) {
        studentAverages.set(sId, 0);
        continue;
      }

      if (isPrimary) {
        const total = sGrades.reduce((sum, g) => sum + g.value, 0);
        const avg = cls.grade_total_max! > 0 ? total / cls.grade_total_max! : 0;
        studentAverages.set(sId, avg);
      } else {
        const subjectGroups = new Map<number, { sum: number; count: number }>();
        for (const g of sGrades) {
          const group = subjectGroups.get(g.subject_id) || { sum: 0, count: 0 };
          group.sum += g.value;
          group.count += 1;
          subjectGroups.set(g.subject_id, group);
        }

        let totalPoints = 0;
        let totalCoef = 0;
        for (const [subjId, data] of subjectGroups) {
          const coef = coefMap?.get(subjId) || 1;
          totalPoints += (data.sum / data.count) * coef;
          totalCoef += coef;
        }
        studentAverages.set(sId, totalCoef > 0 ? totalPoints / totalCoef : 0);
      }
    }

    const sorted = [...studentAverages.entries()].sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === studentId) + 1;
    const average = studentAverages.get(studentId) || 0;

    return { rank, average };
  }

  async generateReportCard(studentId: number, periodId: number, year: string) {
    const schoolId = this.reportCardsRepo.currentSchoolId!;
    const student = await this.notesRepo.prisma.student.findUnique({
      where: { id: studentId },
      select: { class_id: true },
    });

    const { rank, average } = await this.computeStudentRank(
      studentId,
      periodId,
    );
    if (average === 0)
      throw new NotFoundException(
        'Aucune note trouvée pour cet élève sur cette période',
      );

    const stats = await this.calculateAverage(studentId, periodId);

    const existing = await this.reportCardsRepo.findOne({
      where: { student_id: studentId, period_id: periodId, year },
    });

    const data = {
      student_id: studentId,
      period_id: periodId,
      year,
      average,
      rank,
      total_points: stats?.totalPoints || 0,
      total_coef: stats?.totalCoef || 0,
      school_id: schoolId,
    };

    return this.notesRepo.prisma.$transaction(async (tx) => {
      if (existing) {
        return tx.reportCard.update({ where: { id: existing.id }, data });
      } else {
        return tx.reportCard.create({ data });
      }
    });
  }
}
