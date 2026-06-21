import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

const mockService = {
  create: jest.fn().mockResolvedValue({ id: 1, name: 'Semestre 1' }),
  list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  getById: jest.fn().mockResolvedValue({ id: 1, name: 'Semestre 1' }),
  update: jest.fn().mockResolvedValue({ id: 1, name: 'Semestre 1 modifié' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('PeriodsController', () => {
  let controller: PeriodsController;
  let service: PeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodsController],
      providers: [{ provide: PeriodsService, useValue: mockService }],
    }).compile();

    controller = module.get<PeriodsController>(PeriodsController);
    service = module.get<PeriodsService>(PeriodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a period', async () => {
    const dto = {
      name: 'Semestre 1',
      start_date: '2025-09-01',
      end_date: '2025-12-31',
      school_id: 1,
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.data.name).toBe('Semestre 1');
  });

  it('should list periods', async () => {
    await controller.list({ page: 1, pageSize: 20 });
    expect(service.list).toHaveBeenCalledWith(1, 20);
  });

  it('should get period by id', async () => {
    await controller.get('1');
    expect(service.getById).toHaveBeenCalledWith(1);
  });

  it('should update a period', async () => {
    await controller.update('1', { name: 'Semestre 1 modifié' });
    expect(service.update).toHaveBeenCalledWith(1, {
      name: 'Semestre 1 modifié',
    });
  });

  it('should delete a period', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result.data).toBeNull();
  });
});
