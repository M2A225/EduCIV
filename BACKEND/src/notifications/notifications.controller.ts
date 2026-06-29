import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentSchool } from '../auth/decorators/current-school.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser('id') userId: number,
    @CurrentSchool() schoolId: number,
  ) {
    const data = await this.notificationsService.findAll(userId, schoolId);
    return { success: true, data, error: null };
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser('id') userId: number,
    @CurrentSchool() schoolId: number,
  ) {
    const data = await this.notificationsService.getUnreadCount(userId, schoolId);
    return { success: true, data, error: null };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: { user_id: number; school_id: number; title: string; body: string; type?: string; link?: string },
  ) {
    const data = await this.notificationsService.create(body);
    return { success: true, data, error: null };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ) {
    const data = await this.notificationsService.markAsRead(Number(id), userId);
    return { success: true, data, error: null };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @CurrentUser('id') userId: number,
    @CurrentSchool() schoolId: number,
  ) {
    const data = await this.notificationsService.markAllAsRead(userId, schoolId);
    return { success: true, data, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ) {
    await this.notificationsService.remove(Number(id), userId);
  }
}
