import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PermissionGuard } from '../auth/guards/permission.guard';

const mockService = {
  create: jest
    .fn()
    .mockResolvedValue({ id: 1, type: 'RETARD', description: 'En retard' }),
  list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  getById: jest.fn().mockResolvedValue({ id: 1, type: 'RETARD' }),
  update: jest.fn().mockResolvedValue({ id: 1, type: 'ABSENCE' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('IncidentsController', () => {
  let controller: IncidentsController;
  let service: IncidentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsController],
      providers: [{ provide: IncidentsService, useValue: mockService }],
    })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IncidentsController>(IncidentsController);
    service = module.get<IncidentsService>(IncidentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an incident', async () => {
    const dto = { student_id: 1, type: 'RETARD', description: 'En retard' };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.data.id).toBe(1);
  });

  it('should list incidents', async () => {
    await controller.list({ page: 1, pageSize: 20 });
    expect(service.list).toHaveBeenCalledWith(1, 20);
  });

  it('should get incident by id', async () => {
    await controller.get('1');
    expect(service.getById).toHaveBeenCalledWith(1);
  });

  it('should update an incident', async () => {
    await controller.update('1', { type: 'ABSENCE' });
    expect(service.update).toHaveBeenCalledWith(1, { type: 'ABSENCE' });
  });

  it('should delete an incident', async () => {
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result.data).toBeNull();
  });
});
