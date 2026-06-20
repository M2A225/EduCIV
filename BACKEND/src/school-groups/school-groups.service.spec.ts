import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SchoolGroupsService } from './school-groups.service';
import { SchoolGroupsRepository } from './school-groups.repository';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('SchoolGroupsService', () => {
  let service: SchoolGroupsService;
  const prisma = mockPrismaService;

  const mockRepo = {
    find: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolGroupsService,
        { provide: SchoolGroupsRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SchoolGroupsService>(SchoolGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a school group', async () => {
      const dto = { name: 'Groupe A', abbreviation: 'GA', city: 'Douala' };
      const created = { id: 1, ...dto };
      prisma.schoolGroup.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.schoolGroup.create).toHaveBeenCalledWith({
        data: { name: 'Groupe A', abbreviation: 'GA', city: 'Douala' },
      });
      expect(result).toEqual(created);
    });
  });

  describe('list', () => {
    it('should return all school groups with schools', async () => {
      const groups = [{ id: 1, name: 'Groupe A', schools: [] }];
      prisma.schoolGroup.findMany.mockResolvedValue(groups);

      const result = await service.list();

      expect(prisma.schoolGroup.findMany).toHaveBeenCalledWith({
        include: { schools: true },
      });
      expect(result).toEqual(groups);
    });
  });

  describe('getById', () => {
    it('should return a school group by id', async () => {
      const group = { id: 1, name: 'Groupe A', schools: [] };
      prisma.schoolGroup.findUnique.mockResolvedValue(group);

      const result = await service.getById(1);

      expect(result).toEqual(group);
    });

    it('should return null if not found', async () => {
      prisma.schoolGroup.findUnique.mockResolvedValue(null);

      const result = await service.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a school group', async () => {
      const updated = { id: 1, name: 'Groupe B' };
      prisma.schoolGroup.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Groupe B' });

      expect(prisma.schoolGroup.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Groupe B', abbreviation: undefined, city: undefined },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a school group', async () => {
      prisma.schoolGroup.delete.mockResolvedValue({ id: 1 });

      const result = await service.delete(1);

      expect(prisma.schoolGroup.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBeDefined();
    });
  });

  describe('addSchool', () => {
    it('should assign a school to a group', async () => {
      prisma.school.update.mockResolvedValue({ id: 1, school_group_id: 1 });

      const result = await service.addSchool(1, 1);

      expect(prisma.school.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { school_group_id: 1 },
      });
      expect(result).toBeDefined();
    });
  });

  describe('removeSchool', () => {
    it('should remove a school from a group', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_group_id: 1 });
      prisma.school.update.mockResolvedValue({ id: 1, school_group_id: null });

      const result = await service.removeSchool(1, 1);

      expect(prisma.school.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { school_group_id: null },
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if school does not belong to group', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_group_id: 2 });

      await expect(service.removeSchool(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if school has no group', async () => {
      prisma.school.findUnique.mockResolvedValue({ school_group_id: null });

      await expect(service.removeSchool(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAvailableSchools', () => {
    it('should return schools without a group', async () => {
      const schools = [{ id: 1, name: 'School A' }];
      prisma.school.findMany.mockResolvedValue(schools);

      const result = await service.getAvailableSchools();

      expect(prisma.school.findMany).toHaveBeenCalledWith({
        where: { school_group_id: null },
        select: { id: true, name: true, city: true, school_type: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(schools);
    });
  });
});
