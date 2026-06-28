import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../core/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return notifications for user and school', async () => {
      const notifs = [{ id: 1, title: 'Test', user_id: 1, school_id: 1 }];
      mockPrisma.notification.findMany.mockResolvedValue(notifs);

      const result = await service.findAll(1, 1);

      expect(result).toEqual(notifs);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 1, school_id: 1 },
        orderBy: { created_at: 'desc' },
        take: 50,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(1, 1);

      expect(result).toEqual({ count: 5 });
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { user_id: 1, school_id: 1, read_at: null },
      });
    });

    it('should return 0 when no unread', async () => {
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(1, 1);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = { user_id: 1, school_id: 1, title: 'Test', body: 'Body' };
      const created = { id: 1, ...dto, type: 'info', created_at: new Date() };
      mockPrisma.notification.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          school_id: 1,
          title: 'Test',
          body: 'Body',
          type: 'info',
          link: undefined,
        },
      });
    });

    it('should use provided type', async () => {
      const dto = { user_id: 1, school_id: 1, title: 'T', body: 'B', type: 'warning' };
      mockPrisma.notification.create.mockResolvedValue({ id: 1 });

      await service.create(dto);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'warning' }),
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notif = { id: 1, user_id: 1, read_at: null };
      mockPrisma.notification.findUnique.mockResolvedValue(notif);
      mockPrisma.notification.update.mockResolvedValue({ ...notif, read_at: new Date() });

      const result = await service.markAsRead(1, 1);

      expect(result).toBeDefined();
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { read_at: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user_id does not match', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(service.markAsRead(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(1, 1);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { user_id: 1, school_id: 1, read_at: null },
        data: { read_at: expect.any(Date) },
      });
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 1, user_id: 1 });
      mockPrisma.notification.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1, 1);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user_id does not match', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
