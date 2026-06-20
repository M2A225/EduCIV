import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { SubjectsRepository } from './subjects.repository';

describe('SubjectsService', () => {
  let service: SubjectsService;

  const mockRepo = {
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: SubjectsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subject', async () => {
      const dto = { name: 'Mathématiques', coefficient: 4 };
      mockRepo.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('Mathématiques');
    });
  });

  describe('list', () => {
    it('should return paginated subjects', async () => {
      const subjects = [{ id: 1, name: 'Math', coefficient: 4 }];
      mockRepo.findMany.mockResolvedValue(subjects);

      const result = await service.list(1, 20);

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(subjects);
    });
  });

  describe('getById', () => {
    it('should return a subject by id', async () => {
      const subject = { id: 1, name: 'Math', coefficient: 4 };
      mockRepo.findOne.mockResolvedValue(subject);

      const result = await service.getById(1);

      expect(result).toEqual(subject);
    });

    it('should throw if subject not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow('Matière introuvable');
    });
  });
});
