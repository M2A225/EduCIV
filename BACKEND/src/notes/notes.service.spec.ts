import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { ReportCardsRepository } from './report-cards.repository';
import { PrismaService } from '../core/prisma.service';

const mockNotesRepo = {
  create: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  currentSchoolId: 1,
  prisma: {} as unknown as PrismaService,
  getStudentGrades: jest.fn(),
};

const mockReportCardsRepo = {
  findOne: jest.fn(),
  currentSchoolId: 1,
};

const mockPrisma = {
  student: { findUnique: jest.fn(), findMany: jest.fn() },
  subject: { findMany: jest.fn() },
  grade: { findMany: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
  class: { findUnique: jest.fn() },
  reportCard: { findUnique: jest.fn() },

  $transaction: jest.fn((cb: any) => {
    const tx = {
      grade: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
        createMany: jest.fn(),
      },
      reportCard: { update: jest.fn(), create: jest.fn() },
    };

    return cb(tx);
  }),
};

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    mockNotesRepo.prisma = mockPrisma;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: NotesRepository, useValue: mockNotesRepo },
        { provide: ReportCardsRepository, useValue: mockReportCardsRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGrade', () => {
    it('should create a grade', async () => {
      const dto = {
        value: 15,
        type: 'INTERROGATION',
        period_id: 1,
        student_id: 1,
        subject_id: 1,
      };
      mockNotesRepo.create.mockResolvedValue({ id: 1, ...dto });
      const result = await service.createGrade(dto);
      expect(result).toHaveProperty('id', 1);
      expect(mockNotesRepo.create).toHaveBeenCalled();
    });
  });

  describe('updateGrade', () => {
    it('should update existing grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, value: 12 });
      mockNotesRepo.update.mockResolvedValue({ id: 1, value: 15 });
      const result = await service.updateGrade(1, { value: 15 });
      expect(result).toHaveProperty('value', 15);
    });

    it('should throw NotFoundException for missing grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateGrade(999, {} as UpdateGradeDto),
      ).rejects.toThrow('Note introuvable');
    });
  });

  describe('deleteGrade', () => {
    it('should delete existing grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1 });
      mockNotesRepo.delete.mockResolvedValue({ id: 1 });
      await service.deleteGrade(1);
      expect(mockNotesRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for missing grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteGrade(999)).rejects.toThrow(
        'Note introuvable',
      );
    });
  });

  describe('getGrade', () => {
    it('should return grade by id', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, value: 15 });
      const result = await service.getGrade(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException', async () => {
      mockNotesRepo.findOne.mockResolvedValue(null);
      await expect(service.getGrade(999)).rejects.toThrow('Note introuvable');
    });
  });

  describe('validateGrade', () => {
    it('should validate a pending grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, status: 'EN_ATTENTE' });
      mockNotesRepo.update.mockResolvedValue({ id: 1, status: 'VALIDE' });
      await service.validateGrade(1, 10);
      expect(mockNotesRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'VALIDE' }),
      );
    });

    it('should reject if grade not pending', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, status: 'VALIDE' });
      await expect(service.validateGrade(1, 10)).rejects.toThrow(
        'Seules les notes en attente peuvent être validées',
      );
    });
  });

  describe('rejectGrade', () => {
    it('should reject a pending grade', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, status: 'EN_ATTENTE' });
      mockNotesRepo.update.mockResolvedValue({ id: 1, status: 'REJETE' });
      await service.rejectGrade(1, 10, 'Incorrect');
      expect(mockNotesRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'REJETE' }),
      );
    });

    it('should reject if grade not pending', async () => {
      mockNotesRepo.findOne.mockResolvedValue({ id: 1, status: 'VALIDE' });
      await expect(service.rejectGrade(1, 10)).rejects.toThrow(
        'Seules les notes en attente peuvent être rejetées',
      );
    });
  });

  describe('validateGrades (bulk)', () => {
    it('should validate multiple pending grades', async () => {
      mockPrisma.grade.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.validateGrades([1, 2, 3], 1);
      expect(result).toEqual({ validated: 3 });
    });

    it('should throw if no pending grades found', async () => {
      mockPrisma.grade.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.validateGrades([999], 1)).rejects.toThrow(
        'Aucune note en attente',
      );
    });
  });

  describe('rejectGrades (bulk)', () => {
    it('should reject multiple pending grades', async () => {
      mockPrisma.grade.updateMany.mockResolvedValue({ count: 2 });
      const result = await service.rejectGrades([1, 2], 1);
      expect(result).toEqual({ rejected: 2 });
    });

    it('should throw if no pending grades found', async () => {
      mockPrisma.grade.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.rejectGrades([999], 1)).rejects.toThrow(
        'Aucune note en attente',
      );
    });
  });

  describe('calculateAverage', () => {
    it('should return null for no grades', async () => {
      mockNotesRepo.getStudentGrades.mockResolvedValue([]);
      const result = await service.calculateAverage(1, 1);
      expect(result).toBeNull();
    });

    it('should compute secondary average with coefficients', async () => {
      mockNotesRepo.getStudentGrades.mockResolvedValue([
        { subject_id: 1, value: 15 },
        { subject_id: 1, value: 10 },
        { subject_id: 2, value: 12 },
      ]);
      mockPrisma.student.findUnique.mockResolvedValue({ class_id: 1 });
      mockPrisma.class.findUnique.mockResolvedValue({ grade_total_max: null });
      mockPrisma.subject.findMany.mockResolvedValue([
        { id: 1, coefficient: 3 },
        { id: 2, coefficient: 2 },
      ]);
      const result = await service.calculateAverage(1, 1);
      expect(result).toHaveProperty('generalAverage');
      expect(result).toHaveProperty('totalPoints');
    });
  });
});
