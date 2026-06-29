import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number, schoolId: number) {
    return this.prisma.notification.findMany({
      where: { user_id: userId, school_id: schoolId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number, schoolId: number) {
    const count = await this.prisma.notification.count({
      where: {
        user_id: userId,
        school_id: schoolId,
        read_at: null,
      },
    });
    return { count };
  }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user_id: dto.user_id,
        school_id: dto.school_id,
        title: dto.title,
        body: dto.body,
        type: dto.type || 'info',
        link: dto.link,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read_at: new Date() },
    });
  }

  async markAllAsRead(userId: number, schoolId: number) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        school_id: schoolId,
        read_at: null,
      },
      data: { read_at: new Date() },
    });

    return { success: true };
  }

  async remove(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }
}
