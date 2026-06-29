import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../core/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userSchool: {
      create: jest.fn(),
    },
  };

  const mockRepo = {
    findByEmailGlobal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1, email: 'test@test.com' }];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await service.list(1, 20);

      expect(result).toEqual(users);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { id: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      const dto = { email: 'test@test.com', password: 'pw123', name: 'Test' };
      const created = { id: 1, ...dto, password: 'hashed_pw' };
      mockPrisma.user.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('pw123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should create userSchool when school_id provided', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockPrisma.user.create.mockResolvedValue({ id: 1 });
      mockPrisma.userSchool.create.mockResolvedValue({ id: 1 });

      await service.create({ email: 't@t.com', password: 'pw', school_id: 1 });

      expect(mockPrisma.userSchool.create).toHaveBeenCalledWith({
        data: { user_id: 1, school_id: 1, role: 'PARENT' },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.user.update.mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should hash password on update', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      mockPrisma.user.update.mockResolvedValue({ id: 1 });

      await service.update(1, { password: 'new_pw' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new_pw', 10);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.user.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(result).toBeDefined();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email via repo', async () => {
      mockRepo.findByEmailGlobal.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const result = await service.findByEmail('test@test.com');

      expect(result).toBeDefined();
      expect(mockRepo.findByEmailGlobal).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('findByIdentifier', () => {
    it('should find user by email or phone', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const result = await service.findByIdentifier('test@test.com');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'test@test.com' }, { phone: 'test@test.com' }] },
      });
      expect(result).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.findById(1);

      expect(result).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword({ password: 'hashed' }, 'pw');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('pw', 'hashed');
    });

    it('should return false for wrong password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword({ password: 'hashed' }, 'wrong');

      expect(result).toBe(false);
    });
  });
});
