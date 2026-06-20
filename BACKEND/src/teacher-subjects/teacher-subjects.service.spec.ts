import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeacherSubjectsService } from './teacher-subjects.service';
import { TeacherSubjectsRepository } from './teacher-subjects.repository';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('TeacherSubjectsService', () => {
  let service: TeacherSubjectsService;
  const prisma = mockPrismaService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherSubjectsService,
        { provide: TeacherSubjectsRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TeacherSubjectsService>(TeacherSubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a teacher-subject assignment', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      prisma.subject.findUnique.mockResolvedValue({ id: 1 });
      prisma.class.findUnique.mockResolvedValue({ id: 1 });
      const created = { id: 1, teacher_id: 1, subject_id: 1, class_id: 1 };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create({
        teacher_id: 1,
        subject_id: 1,
        class_id: 1,
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        teacher_id: 1,
        subject_id: 1,
        class_id: 1,
      });
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);
      prisma.subject.findUnique.mockResolvedValue({ id: 1 });
      prisma.class.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.create({ teacher_id: 999, subject_id: 1, class_id: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if subject not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      prisma.subject.findUnique.mockResolvedValue(null);
      prisma.class.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.create({ teacher_id: 1, subject_id: 999, class_id: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if class not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      prisma.subject.findUnique.mockResolvedValue({ id: 1 });
      prisma.class.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ teacher_id: 1, subject_id: 1, class_id: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return all assignments', async () => {
      const assignments = [{ id: 1, teacher: {}, subject: {}, class: {} }];
      mockRepo.find.mockResolvedValue(assignments);

      const result = await service.list();

      expect(mockRepo.find).toHaveBeenCalledWith({
        include: { teacher: true, subject: true, class: true },
        orderBy: [{ teacher_id: 'asc' }, { subject_id: 'asc' }],
      });
      expect(result).toEqual(assignments);
    });
  });

  describe('getByTeacher', () => {
    it('should return assignments for a teacher', async () => {
      const assignments = [{ id: 1, subject: {}, class: {} }];
      mockRepo.find.mockResolvedValue(assignments);

      const result = await service.getByTeacher(1);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { teacher_id: 1 },
        include: { subject: true, class: true },
        orderBy: { subject_id: 'asc' },
      });
      expect(result).toEqual(assignments);
    });
  });

  describe('getMyAssignments', () => {
    it('should return assignments for the current user', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'teacher@mail.com' });
      prisma.teacher.findFirst.mockResolvedValue({ id: 5 });
      const assignments = [{ id: 1 }];
      mockRepo.find.mockResolvedValue(assignments);

      const result = await service.getMyAssignments(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { email: true },
      });
      expect(prisma.teacher.findFirst).toHaveBeenCalledWith({
        where: { email: 'teacher@mail.com' },
      });
      expect(result).toEqual(assignments);
    });

    it('should return empty if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getMyAssignments(999);

      expect(result).toEqual([]);
    });

    it('should return empty if user has no email', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: null });

      const result = await service.getMyAssignments(1);

      expect(result).toEqual([]);
    });

    it('should return empty if teacher not found for email', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'unknown@mail.com' });
      prisma.teacher.findFirst.mockResolvedValue(null);

      const result = await service.getMyAssignments(1);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an assignment', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
