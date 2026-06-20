import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PrismaService } from '../core/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import { REDIS_CLIENT } from '../common/redis.provider';

import { JsonWebTokenError } from 'jsonwebtoken';

const mockJwt = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn().mockReturnValue({ sub: 1 }),
};

const mockUsers = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdentifier: jest.fn(),
  verifyPassword: jest.fn(),
  create: jest.fn(),
};
mockUsers.findByEmail.mockResolvedValue({
  id: 1,
  email: 'a',
  password: 'hashed',
  school_id: 'school_1',
});
mockUsers.findById.mockResolvedValue({
  id: 1,
  email: 'a',
  password: 'hashed',
  school_id: 'school_1',
});
mockUsers.findByIdentifier.mockResolvedValue({
  id: 1,
  email: 'a',
  password: 'hashed',
  school_id: 'school_1',
});
mockUsers.verifyPassword.mockResolvedValue(true);

const mockRefreshRepo = {
  find: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  findOne: jest.fn(),
};

const mockPrisma = {
  school: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  userSchool: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  studentParent: {
    createMany: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: Record<string, unknown>) => unknown) => {
    const tx = {
      userSchool: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      studentParent: {
        createMany: jest.fn(),
      },
    };
    return fn(tx);
  }),
};

const mockInvitations = {
  verifyInvitation: jest.fn(),
  useInvitation: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwt },
        { provide: UsersService, useValue: mockUsers },
        { provide: RefreshTokenRepository, useValue: mockRefreshRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: InvitationsService, useValue: mockInvitations },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockUsers.findByEmail.mockResolvedValue({
        id: 1,
        email: 'a',
        school_id: 's1',
      });
      mockUsers.verifyPassword.mockResolvedValue(true);

      const result = await service.login('a', 'p');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('school_ids');
      expect(mockRedis.del).toHaveBeenCalledWith('educiv:auth:attempts:a');
    });

    it('should block login after 5 failed attempts', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockUsers.verifyPassword.mockResolvedValue(false);
      mockRedis.incr.mockResolvedValue(5);

      await expect(service.login('a', 'p')).rejects.toThrow(
        'Mot de passe incorrect',
      );
      expect(mockRedis.set).toHaveBeenCalledWith('educiv:auth:block:a', '1', {
        ex: 900,
      });
    });

    it('should login successfully even if Redis is down (fallback on Redis connection failure)', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis Connection Timeout'));
      mockRedis.del.mockRejectedValue(new Error('Redis Connection Timeout'));

      jest
        .spyOn(service['usersService'], 'findByIdentifier')
        .mockResolvedValue({
          id: 1,
          email: 'a',
          password: 'hashed',
          school_id: 1,
        } as any);
      mockUsers.verifyPassword.mockResolvedValue(true);

      const result = await service.login('a', 'password');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should block login after 5 attempts locally if Redis is down', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis Connection Timeout'));
      mockRedis.incr.mockRejectedValue(new Error('Redis Connection Timeout'));

      jest
        .spyOn(service['usersService'], 'findByIdentifier')
        .mockResolvedValue({
          id: 1,
          email: 'b',
          password: 'hashed',
          school_id: 1,
        } as any);
      mockUsers.verifyPassword.mockResolvedValue(false);

      for (let i = 0; i < 4; i++) {
        await expect(service.login('b', 'wrong')).rejects.toThrow(
          'Mot de passe incorrect',
        );
      }

      await expect(service.login('b', 'wrong')).rejects.toThrow(
        'Mot de passe incorrect',
      );

      mockUsers.verifyPassword.mockClear();
      await expect(service.login('b', 'any')).rejects.toThrow(
        'Compte temporairement bloqué',
      );
      expect(mockUsers.verifyPassword).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should rotate refresh token and return user profile', async () => {
      mockRefreshRepo.findOne.mockResolvedValue({
        token: 'old_token',
        user_id: 1,
      });
      mockJwt.verify.mockReturnValue({ sub: 1 });
      mockUsers.findById.mockResolvedValue({
        id: 1,
        email: 'a',
        role: 'TEACHER',
        school_id: 1,
      });
      mockRefreshRepo.find.mockResolvedValue([]);

      const result = await service.refresh('old_token');

      expect(mockRefreshRepo.delete).toHaveBeenCalledWith({
        token: 'old_token',
      });
      expect(mockRefreshRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('role');
    });

    it('should throw UnauthorizedException for unknown refresh token', async () => {
      mockRefreshRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh('invalid_token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should reject expired or malformed JWT', async () => {
      mockRefreshRepo.findOne.mockResolvedValue({
        token: 'expired',
        user_id: 1,
      });
      mockJwt.verify.mockImplementation(() => {
        throw new JsonWebTokenError('jwt expired');
      });

      await expect(service.refresh('expired')).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });
  });

  describe('registerWithInvitation', () => {
    const validDto = {
      code: 'VALID_CODE',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const validVerification = {
      valid: true,
      school_id: 1,
      target_ids: [10, 11],
      target_type: 'PARENT',
    };

    it('should throw BadRequestException for invalid invitation', async () => {
      mockInvitations.verifyInvitation.mockResolvedValue({
        valid: false,
        school_id: null,
        target_ids: null,
        target_type: null,
      });

      await expect(service.registerWithInvitation(validDto)).rejects.toThrow(
        'Invitation invalide ou expirée',
      );
    });

    it('should throw BadRequestException when email and phone are both missing', async () => {
      mockInvitations.verifyInvitation.mockResolvedValue(validVerification);

      await expect(
        service.registerWithInvitation({ ...validDto, email: undefined }),
      ).rejects.toThrow('Email ou téléphone requis');
    });

    it('should link existing user to school and create student-parent links', async () => {
      mockInvitations.verifyInvitation.mockResolvedValue(validVerification);
      mockUsers.findByIdentifier.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashed',
        school_id: 1,
        role: 'TEACHER',
      });
      mockUsers.verifyPassword.mockResolvedValue(true);
      mockRedis.get.mockResolvedValue(null);

      const result = await service.registerWithInvitation(validDto);

      expect(mockInvitations.useInvitation).toHaveBeenCalledWith('VALID_CODE');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should create new user and link student-parent for parent invitation', async () => {
      mockInvitations.verifyInvitation.mockResolvedValue(validVerification);
      mockUsers.findByIdentifier.mockResolvedValueOnce(null).mockResolvedValue({
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        role: 'PARENT',
      });
      mockUsers.create.mockResolvedValue({
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        role: 'PARENT',
      });
      mockUsers.verifyPassword.mockResolvedValue(true);
      mockRedis.get.mockResolvedValue(null);

      const result = await service.registerWithInvitation(validDto);

      expect(mockUsers.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', role: 'PARENT' }),
      );
      expect(mockInvitations.useInvitation).toHaveBeenCalledWith('VALID_CODE');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('linkInvitation', () => {
    it('should throw NotFoundException for missing user', async () => {
      mockUsers.findById.mockResolvedValue(null);

      await expect(service.linkInvitation(999, 'CODE')).rejects.toThrow(
        'Utilisateur introuvable',
      );
    });

    it('should throw BadRequestException for invalid invitation', async () => {
      mockUsers.findById.mockResolvedValue({ id: 1, email: 'a' });
      mockInvitations.verifyInvitation.mockResolvedValue({
        valid: false,
        school_id: null,
        target_ids: null,
        target_type: null,
      });

      await expect(service.linkInvitation(1, 'BAD_CODE')).rejects.toThrow(
        'Invitation invalide ou expirée',
      );
    });

    it('should link user to school and create student-parent links for parent invitation', async () => {
      mockUsers.findById.mockResolvedValue({
        id: 1,
        email: 'a',
        role: 'TEACHER',
      });
      mockInvitations.verifyInvitation.mockResolvedValue({
        valid: true,
        school_id: 1,
        target_ids: [10, 11],
        target_type: 'PARENT',
      });

      await service.linkInvitation(1, 'PARENT_CODE');

      expect(mockInvitations.useInvitation).toHaveBeenCalledWith('PARENT_CODE');
    });
  });

  describe('getProfile', () => {
    it('should return user profile with roles and school_ids', async () => {
      mockUsers.findById.mockResolvedValue({
        id: 1,
        name: 'Alice',
        email: 'a@test.com',
        phone: '123',
        role: 'TEACHER',
        school_id: 1,
      });
      mockPrisma.userSchool.findMany.mockResolvedValue([
        { school_id: 1, role: 'TEACHER', scope: 'SCHOOL' },
        { school_id: 2, role: 'DIRECTOR', scope: 'SCHOOL' },
      ]);

      const result = await service.getProfile(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Alice');
      expect(result).toHaveProperty('roles');
      expect(result.roles).toContain('TEACHER');
      expect(result.roles).toContain('DIRECTOR');
      expect(result.school_ids).toEqual(expect.arrayContaining([1, 2]));
    });

    it('should throw UnauthorizedException for missing user', async () => {
      mockUsers.findById.mockResolvedValue(null);
      await expect(service.getProfile(999)).rejects.toThrow('User not found');
    });
  });

  describe('switchRole', () => {
    it('should switch role and return new tokens with user', async () => {
      mockUsers.findById.mockResolvedValue({
        id: 1,
        name: 'Alice',
        email: 'a@test.com',
        role: 'TEACHER',
        school_id: 1,
      });
      mockPrisma.userSchool.findMany.mockResolvedValue([
        { school_id: 1, role: 'TEACHER', scope: 'SCHOOL' },
        { school_id: 1, role: 'DIRECTOR', scope: 'SCHOOL' },
      ]);
      mockRefreshRepo.find.mockResolvedValue([]);

      const result = await service.switchRole(1, 1, 'DIRECTOR');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id', 1);
    });

    it('should throw ForbiddenException if role not assigned to school', async () => {
      mockUsers.findById.mockResolvedValue({
        id: 1,
        name: 'Alice',
        role: 'TEACHER',
        school_id: 1,
      });
      mockPrisma.userSchool.findMany.mockResolvedValue([
        { school_id: 1, role: 'TEACHER', scope: 'SCHOOL' },
      ]);

      await expect(service.switchRole(1, 1, 'DIRECTOR')).rejects.toThrow(
        'Rôle non attribué',
      );
    });
  });
});
