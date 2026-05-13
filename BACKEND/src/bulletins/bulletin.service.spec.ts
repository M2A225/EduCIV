import { Test, TestingModule } from '@nestjs/testing';
import { BulletinService } from './bulletin.service';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';

jest.mock('pdfmake', () => {
  return jest.fn().mockImplementation(() => ({
    createPdfKitDocument: jest.fn().mockReturnValue({
      on: jest.fn(),
      end: jest.fn(),
    }),
  }));
});

describe('BulletinService (Integration)', () => {
  let service: BulletinService;
  let mockPrisma: any;
  let mockStorage: any;

  beforeEach(async () => {
    mockPrisma = {
      student: { findUnique: jest.fn().mockResolvedValue({ name: 'Jean Dupont' }) },
      grade: { findMany: jest.fn().mockResolvedValue([{ value: 15, subject: { name: 'Maths' } }]) },
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
    const url = await service.generateBulletin(1, 1);
    expect(mockStorage.uploadFile).toHaveBeenCalled();
    expect(url).toBe('http://signed-url.com');
  });
});
