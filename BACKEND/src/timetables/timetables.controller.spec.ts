import { Test, TestingModule } from '@nestjs/testing';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../core/prisma.service';

describe('TimetablesController', () => {
  let controller: TimetablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimetablesController],
      providers: [
        {
          provide: TimetablesService,
          useValue: { create: jest.fn(), list: jest.fn() },
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

    controller = module.get<TimetablesController>(TimetablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
