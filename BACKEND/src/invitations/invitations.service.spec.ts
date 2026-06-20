import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('InvitationsService', () => {
  let service: InvitationsService;
  const prisma = mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateParentCode', () => {
    it('should generate a parent invitation code', async () => {
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue('abcdef'),
      });
      prisma.invitation.create.mockResolvedValue({ id: 1 });

      const result = await service.generateParentCode([1, 2], 1, 10);

      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: {
          code: expect.stringMatching(/^EDU-\d{8}-[A-F0-9]{6}$/),
          target_type: 'PARENT',
          target_ids: JSON.stringify([1, 2]),
          school_id: 1,
          created_by: 10,
        },
      });
      expect(result).toMatch(/^EDU-\d{8}-[A-F0-9]{6}$/);
    });
  });

  describe('generateTeacherToken', () => {
    it('should generate a teacher invitation token', async () => {
      (crypto.randomUUID as jest.Mock)
        .mockReturnValueOnce('full-uuid-token')
        .mockReturnValueOnce('shortuuidcoe');
      prisma.invitation.create.mockResolvedValue({ id: 1 });

      const result = await service.generateTeacherToken(5, 1, 10);

      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: {
          code: 'shortuuidcoe',
          token: 'full-uuid-token',
          target_type: 'TEACHER',
          target_ids: JSON.stringify([5]),
          school_id: 1,
          created_by: 10,
        },
      });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('registrationLink');
      expect(result.registrationLink).toContain('token=full-uuid-token');
    });
  });

  describe('verifyInvitation', () => {
    it('should return valid for an active invitation', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      prisma.invitation.findFirst.mockResolvedValue({
        id: 1,
        code: 'EDU-20260101-ABCDEF',
        target_type: 'PARENT',
        target_ids: '[1,2]',
        school_id: 1,
        expires_at: futureDate,
        current_uses: 0,
        max_uses: 5,
      });

      const result = await service.verifyInvitation('EDU-20260101-ABCDEF');

      expect(result.valid).toBe(true);
      expect(result.target_type).toBe('PARENT');
      expect(result.target_ids).toEqual([1, 2]);
    });

    it('should return invalid for expired invitation', async () => {
      const pastDate = new Date('2020-01-01');
      prisma.invitation.findFirst.mockResolvedValue({
        id: 1,
        code: 'EDU-20200101-ABCDEF',
        target_type: 'PARENT',
        target_ids: '[1]',
        school_id: 1,
        expires_at: pastDate,
        current_uses: 0,
        max_uses: 5,
      });

      const result = await service.verifyInvitation('EDU-20200101-ABCDEF');

      expect(result.valid).toBe(false);
    });

    it('should return invalid for exhausted invitation', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      prisma.invitation.findFirst.mockResolvedValue({
        id: 1,
        code: 'EDU-20260101-ABCDEF',
        target_type: 'PARENT',
        target_ids: '[1]',
        school_id: 1,
        expires_at: futureDate,
        current_uses: 5,
        max_uses: 5,
      });

      const result = await service.verifyInvitation('EDU-20260101-ABCDEF');

      expect(result.valid).toBe(false);
    });

    it('should return invalid when invitation not found', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);

      const result = await service.verifyInvitation('NONEXISTENT');

      expect(result.valid).toBe(false);
      expect(result.target_type).toBeNull();
      expect(result.target_ids).toBeNull();
      expect(result.school_id).toBeNull();
    });
  });

  describe('useInvitation', () => {
    it('should increment use count', async () => {
      prisma.invitation.updateMany.mockResolvedValue({ count: 1 });

      await service.useInvitation('EDU-20260101-ABCDEF');

      expect(prisma.invitation.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { code: 'EDU-20260101-ABCDEF' },
            { token: 'EDU-20260101-ABCDEF' },
          ],
        },
        data: { current_uses: { increment: 1 } },
      });
    });
  });
});
