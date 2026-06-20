import { Test, TestingModule } from '@nestjs/testing';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

const mockService = {
  processOperations: jest
    .fn()
    .mockResolvedValue([{ id: 'op1', status: 'success' }]),
  pullData: jest.fn().mockResolvedValue({
    students: [],
    grades: [],
    payments: [],
    attendances: [],
    incidents: [],
    timetables: [],
    synced_at: '2025-01-01',
  }),
};

describe('SyncController', () => {
  let controller: SyncController;
  let service: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [{ provide: SyncService, useValue: mockService }],
    }).compile();

    controller = module.get<SyncController>(SyncController);
    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should push operations via sync', async () => {
    const req = {
      user: { school_ids: [1], primary_school_id: 1 },
      headers: {},
    } as any;
    const result = await controller.sync(
      { operations: [{ entity: 'student', action: 'create' }] },
      req,
    );
    expect(service.processOperations).toHaveBeenCalledWith(1, [
      { entity: 'student', action: 'create' },
    ]);
    expect(result.data[0].status).toBe('success');
  });

  it('should pull data', async () => {
    const req = {
      user: { school_ids: [1], primary_school_id: 1 },
      headers: {},
    } as any;
    const result = await controller.pull(req, '2025-01-01');
    expect(service.pullData).toHaveBeenCalledWith(1, '2025-01-01');
    expect(result.data.synced_at).toBe('2025-01-01');
  });
});
