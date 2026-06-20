import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('ProgressionService', () => {
  let service: ProgressionService;
  const prisma = mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgressionService>(ProgressionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClassStudents', () => {
    it('should return students with computed averages', async () => {
      prisma.student.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Alice',
          matricule: 'MAT001',
          grades: [
            {
              value: 15,
              max_score: 20,
              subject_id: 1,
              subject: { coefficient: 2 },
            },
            {
              value: 12,
              max_score: 20,
              subject_id: 2,
              subject: { coefficient: 1 },
            },
          ],
        },
      ]);

      const result = await service.getClassStudents(1, 1, 1);

      expect(result).toHaveLength(1);
      expect(result[0].average).toBe(9);
      expect(result[0].name).toBe('Alice');
    });

    it('should return 0 average for students with no grades', async () => {
      prisma.student.findMany.mockResolvedValue([
        { id: 1, name: 'Bob', matricule: 'MAT002', grades: [] },
      ]);

      const result = await service.getClassStudents(1, 1, 1);

      expect(result[0].average).toBe(0);
    });

    it('should return empty array for empty class', async () => {
      prisma.student.findMany.mockResolvedValue([]);

      const result = await service.getClassStudents(1, 1, 1);

      expect(result).toEqual([]);
    });
  });

  describe('getClassVotes', () => {
    it('should return votes for a class', async () => {
      const votes = [
        { id: 1, decision: 'ADMIS', teacher: { id: 1, name: 'M. Dupont' } },
      ];
      prisma.teacherProgressionVote.findMany.mockResolvedValue(votes);

      const result = await service.getClassVotes(1, 1, 1);

      expect(prisma.teacherProgressionVote.findMany).toHaveBeenCalledWith({
        where: { class_id: 1, school_year_id: 1 },
        include: { teacher: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(votes);
    });
  });

  describe('vote', () => {
    it('should create a new vote', async () => {
      prisma.teacherProgressionVote.findUnique.mockResolvedValue(null);
      const created = {
        id: 1,
        student_id: 1,
        teacher_id: 1,
        decision: 'ADMIS',
      };
      prisma.teacherProgressionVote.create.mockResolvedValue(created);

      const result = await service.vote(1, 1, 1, 1, 1, 'ADMIS', 'Bon élève');

      expect(prisma.teacherProgressionVote.create).toHaveBeenCalledWith({
        data: {
          student_id: 1,
          teacher_id: 1,
          class_id: 1,
          school_year_id: 1,
          school_id: 1,
          decision: 'ADMIS',
          comment: 'Bon élève',
        },
      });
      expect(result).toEqual(created);
    });

    it('should update an existing vote', async () => {
      prisma.teacherProgressionVote.findUnique.mockResolvedValue({
        id: 1,
        student_id: 1,
        teacher_id: 1,
      });
      const updated = { id: 1, decision: 'REDOUBLE' };
      prisma.teacherProgressionVote.update.mockResolvedValue(updated);

      const result = await service.vote(1, 1, 1, 1, 1, 'REDOUBLE');

      expect(prisma.teacherProgressionVote.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { decision: 'REDOUBLE', comment: undefined, class_id: 1 },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('decide', () => {
    it('should create a student progression', async () => {
      prisma.student.findUnique.mockResolvedValue({
        class_id: 1,
        school_id: 1,
      });
      prisma.studentProgression.findFirst.mockResolvedValue(null);
      const created = { id: 1, student_id: 1, final_decision: 'ADMIS' };
      prisma.studentProgression.create.mockResolvedValue(created);

      const result = await service.decide(1, 1, 1, 'ADMIS', 2, 'Promu');

      expect(prisma.studentProgression.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should update existing progression', async () => {
      prisma.student.findUnique.mockResolvedValue({
        class_id: 1,
        school_id: 1,
      });
      prisma.studentProgression.findFirst.mockResolvedValue({ id: 1 });
      const updated = { id: 1, final_decision: 'REDOUBLE' };
      prisma.studentProgression.update.mockResolvedValue(updated);

      const result = await service.decide(1, 1, 1, 'REDOUBLE');

      expect(prisma.studentProgression.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException if student not in school', async () => {
      prisma.student.findUnique.mockResolvedValue({
        class_id: 1,
        school_id: 2,
      });

      await expect(service.decide(1, 1, 1, 'ADMIS')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.decide(999, 1, 1, 'ADMIS')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('apply', () => {
    it('should apply progressions in a transaction', async () => {
      const progressions = [
        {
          id: 1,
          student_id: 1,
          class_id: 1,
          final_decision: 'ADMIS',
          next_class_id: 2,
          school_id: 1,
        },
        {
          id: 2,
          student_id: 2,
          class_id: 1,
          final_decision: 'REDOUBLE',
          next_class_id: null,
          school_id: 1,
        },
      ];
      prisma.studentProgression.findMany.mockResolvedValue(progressions);

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          student: { update: jest.fn().mockResolvedValue({}) },
          studentProgression: { update: jest.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const result = await service.apply(1, 1);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.applied).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it('should throw BadRequestException if no progressions to apply', async () => {
      prisma.studentProgression.findMany.mockResolvedValue([]);

      await expect(service.apply(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should set class_id to null for EXCLU decisions', async () => {
      const progressions = [
        {
          id: 1,
          student_id: 1,
          class_id: 1,
          final_decision: 'EXCLU',
          next_class_id: null,
          school_id: 1,
        },
      ];
      prisma.studentProgression.findMany.mockResolvedValue(progressions);

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          student: { update: jest.fn().mockResolvedValue({}) },
          studentProgression: { update: jest.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const result = await service.apply(1, 1);

      expect(result.results[0].newClassId).toBeNull();
    });
  });

  describe('getStudentClass', () => {
    it('should return class_id for a student', async () => {
      prisma.student.findUnique.mockResolvedValue({ class_id: 5 });

      const result = await service.getStudentClass(1);

      expect(result).toBe(5);
    });

    it('should return null if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      const result = await service.getStudentClass(999);

      expect(result).toBeNull();
    });
  });

  describe('getCurrentYearId', () => {
    it('should return the current year id', async () => {
      prisma.schoolYear.findFirst.mockResolvedValue({ id: 10 });

      const result = await service.getCurrentYearId(1);

      expect(result).toBe(10);
    });

    it('should throw BadRequestException if no year found', async () => {
      prisma.schoolYear.findFirst.mockResolvedValue(null);

      await expect(service.getCurrentYearId(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('archiveYear', () => {
    it('should archive a school year in a transaction', async () => {
      prisma.schoolYear.findFirst.mockResolvedValue({ id: 1, school_id: 1 });

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          grade: { updateMany: jest.fn().mockResolvedValue({}) },
          attendance: { updateMany: jest.fn().mockResolvedValue({}) },
          schoolYear: {
            update: jest.fn().mockResolvedValue({ id: 1, closed: true }),
          },
        };
        return cb(tx);
      });

      const result = await service.archiveYear(1, 1, 10);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if year not found', async () => {
      prisma.schoolYear.findFirst.mockResolvedValue(null);

      await expect(service.archiveYear(999, 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getYearStats', () => {
    it('should compute year statistics', async () => {
      prisma.studentProgression.findMany.mockResolvedValue([
        {
          id: 1,
          final_decision: 'ADMIS',
          student: { class: { name: '6ème A' } },
        },
        {
          id: 2,
          final_decision: 'ADMIS',
          student: { class: { name: '6ème A' } },
        },
        {
          id: 3,
          final_decision: 'REDOUBLE',
          student: { class: { name: '6ème A' } },
        },
        {
          id: 4,
          final_decision: 'TRANSFERE',
          student: { class: { name: '5ème B' } },
        },
      ]);

      const result = await service.getYearStats(1, 1);

      expect(result.totalStudents).toBe(4);
      expect(result.globalStats.tauxReussite).toBe(50);
      expect(result.globalStats.tauxRedoublement).toBe(25);
      expect(result.globalStats.tauxDepart).toBe(25);
      expect(result.byClass).toHaveLength(2);
    });

    it('should return zero stats for empty data', async () => {
      prisma.studentProgression.findMany.mockResolvedValue([]);

      const result = await service.getYearStats(1, 1);

      expect(result.totalStudents).toBe(0);
      expect(result.globalStats.tauxReussite).toBe(0);
    });
  });

  describe('getFinancialClose', () => {
    it('should compute financial close', async () => {
      prisma.paymentPlan.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Plan A',
          total_amount: 100000,
          payments: [
            { amount_fcfa: 40000, student_id: 1 },
            { amount_fcfa: 30000, student_id: 2 },
          ],
        },
      ]);

      const result = await service.getFinancialClose(1, 1);

      expect(result.totalExpected).toBe(100000);
      expect(result.totalCollected).toBe(70000);
      expect(result.totalOutstanding).toBe(30000);
      expect(result.byPlan).toHaveLength(1);
      expect(result.byPlan[0].outstanding).toBe(30000);
    });

    it('should handle plans with no payments', async () => {
      prisma.paymentPlan.findMany.mockResolvedValue([
        { id: 1, name: 'Plan A', total_amount: 50000, payments: [] },
      ]);

      const result = await service.getFinancialClose(1, 1);

      expect(result.totalExpected).toBe(50000);
      expect(result.totalCollected).toBe(0);
      expect(result.totalOutstanding).toBe(50000);
    });
  });

  describe('createNextYear', () => {
    it('should create the next school year', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_type: 'SECONDAIRE' });
      prisma.schoolYear.findFirst
        .mockResolvedValueOnce({ id: 1, year_range: '2025-2026', closed: true })
        .mockResolvedValueOnce(null);
      prisma.schoolYear.create.mockResolvedValue({
        id: 2,
        year_range: '2026-2027',
      });
      prisma.academicPeriod.create.mockResolvedValue({});

      const result = await service.createNextYear(1);

      expect(prisma.schoolYear.create).toHaveBeenCalledWith({
        data: { year_range: '2026-2027', school_id: 1 },
      });
      expect(result.year_range).toBe('2026-2027');
    });

    it('should throw if no year found', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_type: 'SECONDAIRE' });
      prisma.schoolYear.findFirst.mockResolvedValue(null);

      await expect(service.createNextYear(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if current year not closed', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_type: 'SECONDAIRE' });
      prisma.schoolYear.findFirst.mockResolvedValue({
        id: 1,
        year_range: '2025-2026',
        closed: false,
      });

      await expect(service.createNextYear(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if next year already exists', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_type: 'SECONDAIRE' });
      prisma.schoolYear.findFirst
        .mockResolvedValueOnce({ id: 1, year_range: '2025-2026', closed: true })
        .mockResolvedValueOnce({ id: 2, year_range: '2026-2027' });

      await expect(service.createNextYear(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProgressionOptions', () => {
    it('should return empty if class not found', async () => {
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.getProgressionOptions(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return empty if class has no section and is not 3ème', async () => {
      prisma.class.findUnique.mockResolvedValue({
        level: 'Seconde A',
        section: null,
      });

      const result = await service.getProgressionOptions(1, 1);

      expect(result).toEqual([]);
    });

    it('should return secondes for 3ème classes', async () => {
      prisma.class.findUnique.mockResolvedValue({
        level: '3ème',
        section: null,
      });
      prisma.class.findMany.mockResolvedValue([
        { id: 1, name: 'Seconde A', level: 'Seconde A', section: 'A' },
        { id: 2, name: 'Seconde B', level: 'Seconde B', section: 'B' },
        { id: 3, name: '5ème A', level: '5ème', section: 'A' },
      ]);

      const result = await service.getProgressionOptions(1, 1);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ label: 'Seconde A', classId: 1 });
      expect(result[2]).toEqual({
        label: "Affecté par l'État (TRANSFERE)",
        classId: null,
      });
    });

    it('should match options from ClassProgressionOption for sectioned classes', async () => {
      prisma.class.findUnique.mockResolvedValue({
        level: '6ème',
        section: 'A',
      });
      prisma.classProgressionOption.findMany.mockResolvedValue([
        { to_class_level: '5ème', to_section: 'A' },
      ]);
      prisma.class.findMany.mockResolvedValue([
        { id: 2, name: '5ème A', level: '5ème', section: 'A' },
      ]);

      const result = await service.getProgressionOptions(1, 1);

      expect(result).toEqual([{ label: '5ème A', classId: 2 }]);
    });

    it('should filter out unmatched options', async () => {
      prisma.class.findUnique.mockResolvedValue({
        level: '6ème',
        section: 'A',
      });
      prisma.classProgressionOption.findMany.mockResolvedValue([
        { to_class_level: '5ème', to_section: 'B' },
      ]);
      prisma.class.findMany.mockResolvedValue([
        { id: 1, name: '5ème A', level: '5ème', section: 'A' },
      ]);

      const result = await service.getProgressionOptions(1, 1);

      expect(result).toEqual([]);
    });
  });
});
