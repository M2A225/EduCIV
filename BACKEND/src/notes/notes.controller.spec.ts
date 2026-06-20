import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../core/prisma.service';

describe('NotesController', () => {
  let controller: NotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: {
            createGrade: jest.fn(),
            bulkCreateGrades: jest.fn(),
            list: jest.fn(),
            getPendingValidation: jest.fn(),
            getGrade: jest.fn(),
            getStudentGrades: jest.fn(),
            getClassPeriodGrid: jest.fn(),
            updateGrade: jest.fn(),
            deleteGrade: jest.fn(),
            validateGrade: jest.fn(),
            rejectGrade: jest.fn(),
            generateReportCard: jest.fn(),
            calculateAverage: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: PrismaService,
          useValue: {
            school: { findUnique: jest.fn(), findMany: jest.fn() },
            userSchool: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
