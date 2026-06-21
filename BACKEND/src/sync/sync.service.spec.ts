import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../core/prisma.service';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
const createMockModel = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  groupBy: jest.fn(),
});

const mockPrisma = {
  student: createMockModel(),
  grade: createMockModel(),
  payment: createMockModel(),
  attendance: createMockModel(),
  incident: createMockModel(),
  timetable: createMockModel(),
  syncOperation: createMockModel(),
  subject: createMockModel(),
  class: createMockModel(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  $transaction: jest.fn((cb: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tx: Record<string, Record<string, jest.Mock>> = {
      student: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      grade: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      payment: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      attendance: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      incident: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      timetable: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      teacher: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      class: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      subject: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      syncOperation: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    return cb(tx);
  }),
} as unknown as PrismaService;

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processOperations', () => {
    it('should skip duplicate operations', async () => {
      mockPrisma.syncOperation.findMany.mockResolvedValue([
        { client_operation_id: 'op-1' },
      ]);
      const result = await service.processOperations(1, [
        {
          client_operation_id: 'op-1',
          entity: 'STUDENT',
          type: 'CREATE',
          entity_id: '1',
          payload: {},
        },
      ]);
      expect(result).toEqual([{ id: 'op-1', status: 'skipped' }]);
    });

    it('should process a STUDENT CREATE operation', async () => {
      mockPrisma.syncOperation.findMany.mockResolvedValue([]);
      const result = await service.processOperations(1, [
        {
          client_operation_id: 'op-2',
          entity: 'STUDENT',
          type: 'CREATE',
          entity_id: '1',
          payload: { name: 'Alice' },
        },
      ]);
      expect(result[0].status).toBe('success');
    });

    it('should process a GRADE UPDATE operation', async () => {
      mockPrisma.syncOperation.findMany.mockResolvedValue([]);
      const result = await service.processOperations(1, [
        {
          client_operation_id: 'op-3',
          entity: 'GRADE',
          type: 'UPDATE',
          entity_id: '5',
          payload: { value: 18 },
        },
      ]);
      expect(result[0].status).toBe('success');
    });

    it('should handle unknown entity type gracefully', async () => {
      mockPrisma.syncOperation.findMany.mockResolvedValue([]);
      const result = await service.processOperations(1, [
        {
          client_operation_id: 'op-bad',
          entity: 'UNKNOWN',
          type: 'CREATE',
          entity_id: '1',
          payload: {},
        },
      ]);
      expect(result[0].status).toBe('error');
    });

    it('should process multiple operations in a batch', async () => {
      mockPrisma.syncOperation.findMany.mockResolvedValue([]);
      const result = await service.processOperations(1, [
        {
          client_operation_id: 'op-a',
          entity: 'STUDENT',
          type: 'CREATE',
          entity_id: '1',
          payload: { name: 'A' },
        },
        {
          client_operation_id: 'op-b',
          entity: 'PAYMENT',
          type: 'CREATE',
          entity_id: '2',
          payload: { amount_fcfa: 50000 },
        },
        {
          client_operation_id: 'op-c',
          entity: 'TEACHER',
          type: 'CREATE',
          entity_id: '3',
          payload: { name: 'T' },
        },
      ]);
      expect(result).toHaveLength(3);
      expect(result.every((r) => r.status === 'success')).toBe(true);
    });
  });

  describe('pullData', () => {
    it('should pull data for a school', async () => {
      mockPrisma.student.findMany.mockResolvedValue([{ id: 1, name: 'Alice' }]);
      mockPrisma.grade.findMany.mockResolvedValue([{ id: 1, value: 15 }]);
      mockPrisma.payment.findMany.mockResolvedValue([
        { id: 1, amount_fcfa: 50000 },
      ]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.incident.findMany.mockResolvedValue([]);
      mockPrisma.timetable.findMany.mockResolvedValue([]);

      const result = await service.pullData(1);
      expect(result).toHaveProperty('students');
      expect(result).toHaveProperty('grades');
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('synced_at');
      expect(result.students).toHaveLength(1);
    });

    it('should filter by since date', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.incident.findMany.mockResolvedValue([]);
      mockPrisma.timetable.findMany.mockResolvedValue([]);

      await service.pullData(1, '2024-01-01T00:00:00Z');
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            updated_at: { gte: expect.any(Date) },
          }),
        }),
      );
    });
  });
});
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
