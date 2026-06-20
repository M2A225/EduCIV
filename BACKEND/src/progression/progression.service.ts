import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { DecisionVote, DecisionFinale, PeriodType } from '@prisma/client';

@Injectable()
export class ProgressionService {
  constructor(private readonly prisma: PrismaService) {}

  async getClassStudents(classId: number, yearId: number, schoolId: number) {
    const students = await this.prisma.student.findMany({
      where: { class_id: classId, school_id: schoolId },
      include: {
        grades: {
          where: {
            period: { school_year_id: yearId },
            status: 'VALIDE',
          },
          select: {
            value: true,
            max_score: true,
            subject_id: true,
            subject: { select: { coefficient: true } },
          },
        },
      },
    });

    return students.map((s) => {
      const totalPoints = s.grades.reduce((sum, g) => sum + g.value, 0);
      const totalCoef = s.grades.reduce(
        (sum, g) => sum + (g.subject?.coefficient || 1),
        0,
      );
      return {
        id: s.id,
        name: s.name,
        matricule: s.matricule,
        average:
          totalCoef > 0 ? Math.round((totalPoints / totalCoef) * 100) / 100 : 0,
      };
    });
  }

  async getClassVotes(classId: number, yearId: number, schoolId: number) {
    return this.prisma.teacherProgressionVote.findMany({
      where: { class_id: classId, school_year_id: yearId },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  async vote(
    studentId: number,
    teacherId: number,
    classId: number,
    yearId: number,
    schoolId: number,
    decision: DecisionVote,
    comment?: string,
  ) {
    const existing = await this.prisma.teacherProgressionVote.findUnique({
      where: {
        student_id_teacher_id_school_year_id: {
          student_id: studentId,
          teacher_id: teacherId,
          school_year_id: yearId,
        },
      },
    });

    if (existing) {
      return this.prisma.teacherProgressionVote.update({
        where: { id: existing.id },
        data: { decision, comment, class_id: classId },
      });
    }

    return this.prisma.teacherProgressionVote.create({
      data: {
        student_id: studentId,
        teacher_id: teacherId,
        class_id: classId,
        school_year_id: yearId,
        school_id: schoolId,
        decision,
        comment,
      },
    });
  }

  async decide(
    studentId: number,
    schoolYearId: number,
    schoolId: number,
    finalDecision: DecisionFinale,
    nextClassId?: number,
    comment?: string,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { class_id: true, school_id: true },
    });
    if (!student || student.school_id !== schoolId)
      throw new ForbiddenException('Accès refusé');

    const existing = await this.prisma.studentProgression.findFirst({
      where: { student_id: studentId, school_year_id: schoolYearId },
    });

    const data = {
      class_id: student.class_id,
      final_decision: finalDecision,
      next_class_id: nextClassId || null,
      comment: comment || null,
    };

    if (existing) {
      return this.prisma.studentProgression.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.studentProgression.create({
      data: {
        student_id: studentId,
        school_year_id: schoolYearId,
        school_id: schoolId,
        ...data,
      },
    });
  }

  async apply(schoolYearId: number, schoolId: number) {
    const progressions = await this.prisma.studentProgression.findMany({
      where: {
        school_year_id: schoolYearId,
        school_id: schoolId,
        applied_at: null,
      },
    });

    if (progressions.length === 0) {
      throw new BadRequestException('Aucune décision à appliquer');
    }

    const now = new Date();
    const studentsToUpdate = progressions.map((p) => ({
      studentId: p.student_id,
      progressionId: p.id,
      newClassId:
        p.final_decision === 'ADMIS' && p.next_class_id
          ? p.next_class_id
          : p.final_decision === 'REDOUBLE'
            ? p.class_id
            : null,
      isRepeater: p.final_decision === 'REDOUBLE',
      isAffected:
        p.final_decision === 'ADMIS' || p.final_decision === 'REDOUBLE',
      decision: p.final_decision,
    }));

    await this.prisma.$transaction(async (tx) => {
      for (const s of studentsToUpdate) {
        await tx.student.update({
          where: { id: s.studentId },
          data: {
            class_id: s.newClassId,
            is_repeater: s.isRepeater,
            is_affected: s.isAffected,
          },
        });
        await tx.studentProgression.update({
          where: { id: s.progressionId },
          data: { applied_at: now },
        });
      }
    });

    const results = studentsToUpdate.map((s) => ({
      studentId: s.studentId,
      decision: s.decision,
      newClassId: s.newClassId,
    }));

    return { applied: results.length, results };
  }

  async getStudentClass(studentId: number): Promise<number | null> {
    const s = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { class_id: true },
    });
    return s?.class_id || null;
  }

  async getCurrentYearId(schoolId: number): Promise<number> {
    const year = await this.prisma.schoolYear.findFirst({
      where: { school_id: schoolId },
      orderBy: { id: 'desc' },
    });
    if (!year) throw new BadRequestException('Aucune année scolaire trouvée');
    return year.id;
  }

  async archiveYear(schoolYearId: number, schoolId: number, userId: number) {
    const year = await this.prisma.schoolYear.findFirst({
      where: { id: schoolYearId, school_id: schoolId },
    });
    if (!year) throw new BadRequestException('Année scolaire introuvable');

    return this.prisma.$transaction(async (tx) => {
      await tx.grade.updateMany({
        where: {
          period: { school_year_id: schoolYearId, school_id: schoolId },
        },
        data: { archived: true, archived_at: new Date() },
      });
      await tx.attendance.updateMany({
        where: { school_id: schoolId },
        data: { archived: true, archived_at: new Date() },
      });
      return tx.schoolYear.update({
        where: { id: schoolYearId },
        data: { closed: true, closed_at: new Date(), closed_by: userId },
      });
    });
  }

  async getYearStats(schoolYearId: number, schoolId: number) {
    const progressions = await this.prisma.studentProgression.findMany({
      where: { school_year_id: schoolYearId, school_id: schoolId },
      include: { student: { select: { class: { select: { name: true } } } } },
    });

    const byClass: Record<
      string,
      {
        total: number;
        admis: number;
        redoubles: number;
        transferes: number;
        exclus: number;
        abandons: number;
      }
    > = {};

    for (const p of progressions) {
      const className = (p.student as any)?.class?.name || 'Inconnue';
      if (!byClass[className])
        byClass[className] = {
          total: 0,
          admis: 0,
          redoubles: 0,
          transferes: 0,
          exclus: 0,
          abandons: 0,
        };
      byClass[className].total++;
      if (p.final_decision === 'ADMIS') byClass[className].admis++;
      else if (p.final_decision === 'REDOUBLE') byClass[className].redoubles++;
      else if (p.final_decision === 'TRANSFERE')
        byClass[className].transferes++;
      else if (p.final_decision === 'EXCLU') byClass[className].exclus++;
      else if (p.final_decision === 'ABANDON') byClass[className].abandons++;
    }

    const totalStudents = progressions.length;
    const totalAdmis = progressions.filter(
      (p) => p.final_decision === 'ADMIS',
    ).length;
    const totalRedoubles = progressions.filter(
      (p) => p.final_decision === 'REDOUBLE',
    ).length;
    const totalDeparts = progressions.filter((p) =>
      ['TRANSFERE', 'EXCLU', 'ABANDON'].includes(p.final_decision),
    ).length;

    return {
      totalStudents,
      globalStats: {
        tauxReussite:
          totalStudents > 0
            ? Math.round((totalAdmis / totalStudents) * 100)
            : 0,
        tauxRedoublement:
          totalStudents > 0
            ? Math.round((totalRedoubles / totalStudents) * 100)
            : 0,
        tauxDepart:
          totalStudents > 0
            ? Math.round((totalDeparts / totalStudents) * 100)
            : 0,
      },
      byClass: Object.entries(byClass).map(([className, stats]) => ({
        className,
        ...stats,
        tauxReussite:
          stats.total > 0 ? Math.round((stats.admis / stats.total) * 100) : 0,
      })),
    };
  }

  async getFinancialClose(schoolYearId: number, schoolId: number) {
    const plans = await this.prisma.paymentPlan.findMany({
      where: { school_id: schoolId },
      include: {
        payments: {
          where: { status: 'VALIDE' },
          select: { amount_fcfa: true, student_id: true },
        },
      },
    });

    const byPlan = plans.map((plan) => {
      const collected = plan.payments.reduce(
        (sum, p) => sum + p.amount_fcfa,
        0,
      );
      const outstanding = Math.max(0, plan.total_amount - collected);
      return {
        planId: plan.id,
        planName: plan.name,
        total: plan.total_amount,
        collected,
        outstanding,
        studentsWithBalance:
          outstanding > 0
            ? new Set(plan.payments.map((p) => p.student_id)).size
            : 0,
      };
    });

    const totalExpected = byPlan.reduce((s, p) => s + p.total, 0);
    const totalCollected = byPlan.reduce((s, p) => s + p.collected, 0);
    const totalOutstanding = byPlan.reduce((s, p) => s + p.outstanding, 0);

    return { totalExpected, totalCollected, totalOutstanding, byPlan };
  }

  async createNextYear(schoolId: number) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { school_type: true },
    });
    const schoolType = school?.school_type || 'SECONDAIRE';

    const lastYear = await this.prisma.schoolYear.findFirst({
      where: { school_id: schoolId },
      orderBy: { id: 'desc' },
    });

    if (!lastYear) throw new BadRequestException('Aucune année trouvée');
    if (!lastYear.closed)
      throw new BadRequestException(
        "L'année actuelle doit être archivée d'abord",
      );

    const [startStr, endStr] = lastYear.year_range.split('-');
    const nextStart = parseInt(startStr) + 1;
    const nextEnd = parseInt(endStr) + 1;
    const yearRange = `${nextStart}-${nextEnd}`;

    const existing = await this.prisma.schoolYear.findFirst({
      where: { school_id: schoolId, year_range: yearRange },
    });
    if (existing)
      throw new BadRequestException(`L'année ${yearRange} existe déjà`);

    const schoolYear = await this.prisma.schoolYear.create({
      data: { year_range: yearRange, school_id: schoolId },
    });

    const periods = this.generatePeriods(schoolType, schoolYear.id, schoolId);
    for (const p of periods) {
      await this.prisma.academicPeriod.create({ data: p });
    }

    return schoolYear;
  }

  private generatePeriods(
    schoolType: string,
    schoolYearId: number,
    schoolId: number,
  ) {
    const year = new Date().getFullYear();
    if (
      schoolType === 'LYCEE_TECHNIQUE' ||
      schoolType === 'LYCEE_PROFESSIONNEL'
    ) {
      return [
        {
          name: 'Semestre 1',
          period_type: 'SEMESTRE_1' as PeriodType,
          start_date: new Date(year, 8, 1),
          end_date: new Date(year + 1, 0, 31),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
        {
          name: 'Semestre 2',
          period_type: 'SEMESTRE_2' as PeriodType,
          start_date: new Date(year + 1, 1, 1),
          end_date: new Date(year + 1, 5, 30),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
      ];
    }
    if (schoolType === 'PRIMAIRE') {
      return [
        {
          name: 'Composition 1',
          period_type: 'COMPOSITION_1' as PeriodType,
          start_date: new Date(year, 8, 1),
          end_date: new Date(year, 10, 30),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
        {
          name: 'Composition 2',
          period_type: 'COMPOSITION_2' as PeriodType,
          start_date: new Date(year, 11, 1),
          end_date: new Date(year + 1, 1, 28),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
        {
          name: 'Composition 3',
          period_type: 'COMPOSITION_3' as PeriodType,
          start_date: new Date(year + 1, 2, 1),
          end_date: new Date(year + 1, 4, 31),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
        {
          name: 'Composition 4',
          period_type: 'COMPOSITION_4' as PeriodType,
          start_date: new Date(year + 1, 5, 1),
          end_date: new Date(year + 1, 6, 31),
          school_year_id: schoolYearId,
          school_id: schoolId,
        },
      ];
    }
    return [
      {
        name: 'Trimestre 1',
        period_type: 'TRIMESTRE_1' as PeriodType,
        start_date: new Date(year, 8, 1),
        end_date: new Date(year, 10, 30),
        school_year_id: schoolYearId,
        school_id: schoolId,
      },
      {
        name: 'Trimestre 2',
        period_type: 'TRIMESTRE_2' as PeriodType,
        start_date: new Date(year, 11, 1),
        end_date: new Date(year + 1, 1, 28),
        school_year_id: schoolYearId,
        school_id: schoolId,
      },
      {
        name: 'Trimestre 3',
        period_type: 'TRIMESTRE_3' as PeriodType,
        start_date: new Date(year + 1, 2, 1),
        end_date: new Date(year + 1, 5, 30),
        school_year_id: schoolYearId,
        school_id: schoolId,
      },
    ];
  }

  async getProgressionOptions(classId: number, schoolId: number) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { level: true, section: true },
    });
    if (!cls) throw new BadRequestException('Classe introuvable');

    if (!cls.section) {
      if (cls.level === '3ème') {
        const schoolClasses = await this.prisma.class.findMany({
          where: { school_id: schoolId },
          select: { id: true, name: true, level: true, section: true },
        });
        const secondes = schoolClasses.filter((c) =>
          c.level?.startsWith('Seconde'),
        );
        return [
          ...secondes.map((c) => ({ label: c.name, classId: c.id })),
          { label: "Affecté par l'État (TRANSFERE)", classId: null },
        ];
      }
      return [];
    }

    const options = await this.prisma.classProgressionOption.findMany({
      where: { from_class_level: cls.level!, from_section: cls.section },
    });

    const schoolClasses = await this.prisma.class.findMany({
      where: { school_id: schoolId },
      select: { id: true, name: true, level: true, section: true },
    });

    return options
      .map((opt) => {
        const matching = schoolClasses.find(
          (c) => c.level === opt.to_class_level && c.section === opt.to_section,
        );
        return matching ? { label: matching.name, classId: matching.id } : null;
      })
      .filter(Boolean);
  }
}
