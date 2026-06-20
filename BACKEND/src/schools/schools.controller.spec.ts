import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../core/prisma.service';

describe('SchoolsController', () => {
  let controller: SchoolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsController],
      providers: [
        {
          provide: SchoolsService,
          useValue: {
            createSchool: jest.fn(),
            getSchoolById: jest.fn(),
            getSchoolBySchoolId: jest.fn(),
            getStats: jest.fn(),
            listAll: jest.fn(),
            updateSchool: jest.fn(),
            deleteSchool: jest.fn(),
            uploadSchoolLogo: jest.fn(),
            getFilieres: jest.fn(),
            updateFilieres: jest.fn(),
            getSchoolGroup: jest.fn(),
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

    controller = module.get<SchoolsController>(SchoolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
