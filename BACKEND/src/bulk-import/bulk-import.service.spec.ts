import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';
import { PrismaService } from '../core/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import { mockPrismaService } from '../../test/prisma-mock';

const mockEachRow = jest.fn();
const mockGetRow = jest.fn().mockReturnValue({
  font: {},
  fill: {},
  alignment: {},
});

const createMockWorksheet = () => ({
  addRow: jest.fn(),
  eachRow: mockEachRow,
  getRow: mockGetRow,
  columns: [],
});

let capturedWorkbook: any;

jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn().mockImplementation(function () {
      const ws = createMockWorksheet();
      capturedWorkbook = this;
      this.worksheets = [ws];
      this.xlsx = {
        load: jest.fn().mockImplementation(() => {
          this.worksheets = [ws];
        }),
      };
      this.addWorksheet = jest.fn().mockReturnValue(ws);
    }),
  };
});

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('abcdef1234567890'),
  }),
}));

describe('BulkImportService', () => {
  let service: BulkImportService;
  const prisma = mockPrismaService;

  const mockInvitationsService = {
    generateTeacherToken: jest.fn(),
    generateParentCode: jest.fn(),
  };

  beforeEach(async () => {
    mockEachRow.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportService,
        { provide: PrismaService, useValue: prisma },
        { provide: InvitationsService, useValue: mockInvitationsService },
      ],
    }).compile();

    service = module.get<BulkImportService>(BulkImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTemplate', () => {
    it('should generate a students template', async () => {
      const result = await service.generateTemplate('students');
      expect(result).toBeDefined();
    });

    it('should generate a teachers template', async () => {
      const result = await service.generateTemplate('teachers');
      expect(result).toBeDefined();
    });

    it('should generate a parents template', async () => {
      const result = await service.generateTemplate('parents');
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(service.generateTemplate('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('importStudents', () => {
    it('should return empty result for file with no data rows', async () => {
      mockEachRow.mockImplementation(() => {});

      prisma.class.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importStudents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should import students with parent creation', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb(
          {
            values: [
              null,
              'Nom',
              'MAT001',
              '15/09/2010',
              'Yaoundé',
              'M',
              'Camerounais',
              'NON',
              'Interne',
              'NON',
              '6ème A',
              'Parent Tel',
              '0102030405',
            ],
          },
          2,
        );
      });

      prisma.class.findMany.mockResolvedValue([{ id: 1, name: '6ème A' }]);
      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          student: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          user: { create: jest.fn().mockResolvedValue({ id: 10 }) },
          userSchool: { create: jest.fn().mockResolvedValue({}) },
          studentParent: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      mockInvitationsService.generateTeacherToken.mockResolvedValue({
        token: 'test-token',
        registrationLink: 'https://link.com/token=test-token',
      });

      const result = await service.importStudents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should report error for missing class', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb(
          {
            values: [
              null,
              'Nom',
              'MAT001',
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              'Classe Inconnue',
              null,
              null,
            ],
          },
          2,
        );
      });

      prisma.class.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importStudents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Classe');
    });

    it('should report error for duplicate matricule', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb(
          {
            values: [
              null,
              'Nom',
              'MAT001',
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              '6ème A',
              null,
              null,
            ],
          },
          2,
        );
      });

      prisma.class.findMany.mockResolvedValue([{ id: 1, name: '6ème A' }]);
      prisma.student.findMany.mockResolvedValue([{ matricule: 'MAT001' }]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importStudents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors[0].message).toContain('MAT001');
    });
  });

  describe('importTeachers', () => {
    it('should return empty result for file with no data rows', async () => {
      mockEachRow.mockImplementation(() => {});
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importTeachers(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should report error when neither email nor phone provided', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb({ values: [null, 'Nom', null, null, null, null, null] }, 2);
      });

      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importTeachers(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors[0].message).toContain('email/telephone');
    });

    it('should report error for duplicate email', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb(
          { values: [null, 'Nom', 'dup@mail.com', null, null, null, null] },
          2,
        );
      });

      prisma.user.findMany.mockResolvedValue([
        { email: 'dup@mail.com', phone: null },
      ]);

      const result = await service.importTeachers(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors[0].message).toContain('dup@mail.com');
    });
  });

  describe('importParents', () => {
    it('should return empty result for file with no data rows', async () => {
      mockEachRow.mockImplementation(() => {});
      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importParents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should report error when no email or phone provided', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb({ values: [null, 'Nom', null, null, 'MAT001'] }, 2);
      });

      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importParents(Buffer.alloc(0), 1, 10);

      expect(result.imported).toBe(0);
      expect(result.errors[0].message).toContain('email/telephone');
    });

    it('should report error for missing matricules', async () => {
      mockEachRow.mockImplementation((cb: any) => {
        cb(
          { values: [null, 'Nom', 'p@mail.com', '0102030405', 'UNKNOWN001'] },
          2,
        );
      });

      prisma.student.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.importParents(Buffer.alloc(0), 1, 10);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('UNKNOWN001');
    });
  });
});
