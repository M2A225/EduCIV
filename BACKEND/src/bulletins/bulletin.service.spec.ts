import { Test, TestingModule } from '@nestjs/testing';
import { BulletinService } from './bulletin.service';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';

jest.mock('pdfmake', () => {
  return jest.fn().mockImplementation(() => ({
    createPdfKitDocument: jest.fn().mockReturnValue({
      on: jest.fn().mockImplementation(function (
        this: Record<string, unknown>,
        event: string,
        cb: (...args: unknown[]) => void,
      ) {
        this._handlers = this._handlers || {};
        (this._handlers as Record<string, (...args: unknown[]) => void>)[
          event
        ] = cb;
        return this;
      }),
      end: jest.fn().mockImplementation(function (
        this: Record<string, unknown>,
      ) {
        const h = (this._handlers || {}) as Record<
          string,
          (...args: unknown[]) => void
        >;
        if (h['data']) h['data'](Buffer.from('pdf-content'));
        if (h['end']) h['end']();
      }),
    }),
  }));
});

describe('BulletinService (Integration)', () => {
  let service: BulletinService;
  let mockPrisma: Record<string, unknown>;
  let mockStorage: Record<string, unknown>;

  beforeEach(async () => {
    mockPrisma = {
      student: {
        findUnique: jest.fn().mockResolvedValue({
          name: 'Jean Dupont',
          id: 1,
          school: { name: 'EduCIV Academy' },
          class: { name: '6ème A' },
        }),
      },
      academicPeriod: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Trimestre 1' }),
      },
      grade: {
        findMany: jest.fn().mockResolvedValue([
          {
            value: 15,
            subject_id: 1,
            subject: { name: 'Maths', coefficient: 3 },
          },
        ]),
      },
      reportCard: {
        findFirst: jest.fn().mockResolvedValue({
          id: 1,
          average: 15.0,
          rank: 1,
          total_points: 45.0,
          total_coef: 3.0,
        }),
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    mockStorage = {
      uploadFile: jest.fn().mockResolvedValue({}),
      getSignedUrl: jest.fn().mockResolvedValue('http://signed-url.com'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulletinService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<BulletinService>(BulletinService);
  });

  it('should generate a bulletin, upload it, and return a signed URL', async () => {
    const url = await service.generateBulletin(1, 1, '2025-2026');
    expect(mockStorage.uploadFile).toHaveBeenCalled();
    expect(url).toBe('http://signed-url.com');
  });
});
