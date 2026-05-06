import { Test, TestingModule } from '@nestjs/testing';
import { TimetablesService } from './timetables.service';
import { TimetablesRepository } from './timetables.repository';

describe('TimetablesService', () => {
  let service: TimetablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        {
          provide: TimetablesRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimetablesService>(TimetablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
