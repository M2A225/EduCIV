import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { PermissionGuard } from '../auth/guards/permission.guard';

const mockSubjectsService = {
  create: jest.fn().mockResolvedValue({ id: 1, name: 'Maths', coefficient: 4 }),
  list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  getById: jest
    .fn()
    .mockResolvedValue({ id: 1, name: 'Maths', coefficient: 4 }),
  update: jest
    .fn()
    .mockResolvedValue({ id: 1, name: 'Maths Avancé', coefficient: 5 }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: mockSubjectsService }],
    })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subject and return it', async () => {
      const dto = { name: 'Maths', coefficient: 4, school_id: 1 };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.data.name).toBe('Maths');
    });
  });

  describe('list', () => {
    it('should list subjects with pagination', async () => {
      const result = await controller.list({ page: 1, pageSize: 20 });
      expect(service.list).toHaveBeenCalledWith(1, 20);
      expect(result.data).toEqual({ data: [], total: 0 });
    });
  });

  describe('getById', () => {
    it('should return a subject by id', async () => {
      const result = await controller.get('1');
      expect(service.getById).toHaveBeenCalledWith(1);
      expect(result.data.name).toBe('Maths');
    });
  });

  describe('update', () => {
    it('should update and return the subject', async () => {
      const dto = { name: 'Maths Avancé', coefficient: 5 };
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.data.name).toBe('Maths Avancé');
    });
  });

  describe('remove', () => {
    it('should delete a subject', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result.data).toBeNull();
    });
  });
});
