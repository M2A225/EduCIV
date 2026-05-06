import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushDto } from './dto/push.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
	constructor(private readonly syncService: SyncService) {}

	@Post('push')
	async push(@Body() body: PushDto) {
		const r = await this.syncService.push(body);
		return { success: true, data: r, error: null };
	}

	@Get('pull')
	async pull() {
		const r = await this.syncService.pull();
		return { success: true, data: r, error: null };
	}
}
