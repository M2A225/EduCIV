import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { ParentsRepository } from './parents.repository';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('ParentsService', () => {
  let service: ParentsService;
  const prisma = mockPrismaService;

  const mockRepo = {
    createLink: jest.fn(),
    findLinksByStudent: jest.fn(),
    findLinksByParent: jest.fn(),
    removeLink: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: ParentsRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('linkParent', () => {
    it('should link a parent to a student', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      prisma.user.findUnique.mockResolvedValue({ id: 10 });
      const link = { id: 1, student_id: 1, parent_user_id: 10, school_id: 1 };
      mockRepo.createLink.mockResolvedValue(link);

      const result = await service.linkParent(
        { student_id: 1, parent_user_id: 10, relation: 'Mère' },
        1,
      );

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(mockRepo.createLink).toHaveBeenCalledWith(1, 10, 1, 'Mère');
      expect(result).toEqual(link);
    });

    it('should throw NotFoundException if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.linkParent({ student_id: 999, parent_user_id: 10 }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parent not found', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.linkParent({ student_id: 1, parent_user_id: 999 }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentParents', () => {
    it('should return parents for a student', async () => {
      const links = [{ id: 1, parent: { id: 10, name: 'Parent' } }];
      mockRepo.findLinksByStudent.mockResolvedValue(links);

      const result = await service.getStudentParents(1, 1);

      expect(mockRepo.findLinksByStudent).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(links);
    });
  });

  describe('getParentStudents', () => {
    it('should return students for a parent', async () => {
      const links = [{ id: 1, student: { id: 1, name: 'Élève' } }];
      mockRepo.findLinksByParent.mockResolvedValue(links);

      const result = await service.getParentStudents(10, 1);

      expect(mockRepo.findLinksByParent).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(links);
    });
  });

  describe('unlinkParent', () => {
    it('should remove a parent-student link', async () => {
      prisma.studentParent.findUnique.mockResolvedValue({
        student_id: 1,
        parent_user_id: 10,
        school_id: 1,
      });
      mockRepo.removeLink.mockResolvedValue(undefined);

      await service.unlinkParent(1, 10, 1);

      expect(mockRepo.removeLink).toHaveBeenCalledWith(1, 10);
    });

    it('should throw NotFoundException if link not found', async () => {
      prisma.studentParent.findUnique.mockResolvedValue(null);

      await expect(service.unlinkParent(1, 10, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if school_id does not match', async () => {
      prisma.studentParent.findUnique.mockResolvedValue({
        student_id: 1,
        parent_user_id: 10,
        school_id: 2,
      });

      await expect(service.unlinkParent(1, 10, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
