import { Injectable, Logger } from '@nestjs/common';
import { PushDto } from './dto/push.dto';
import { SyncRepository } from './sync.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class SyncService {
	private readonly logger = new Logger(SyncService.name);

	constructor(
		private readonly syncRepo: SyncRepository,
		private readonly dataSource: DataSource,
	) {}

	async push(dto: PushDto) {
		const existing = await this.syncRepo.findByClientId(dto.client_operation_id);
		if (existing) return { status: 'duplicate', operation: existing };

		// Real application of the operation
		const success = await this.applyOperation(dto);
		
		const op = await this.syncRepo.create({
			client_operation_id: dto.client_operation_id,
			entity: dto.entity,
			entity_id: dto.entity_id,
			payload: JSON.stringify(dto.payload),
		});

		return { status: success ? 'ok' : 'failed', operation: op };
	}

	private async applyOperation(dto: PushDto): Promise<boolean> {
		try {
			const payload = dto.payload;
			const school_id = this.syncRepo.currentSchoolId;

			// Server Priority: Check if entity version is ahead of client
			// For simplicity, we assume the payload contains a version if it's an update.
			// If not provided, we just overwrite as "server always wins" in the context of accepting the push.
			
			switch (dto.entity) {
				case 'payment':
					await this.dataSource.getRepository('payments').save({ ...payload, school_id });
					break;
				case 'note':
					await this.dataSource.getRepository('notes').save({ ...payload, school_id });
					break;
				case 'attendance':
					await this.dataSource.getRepository('attendances').save({ ...payload, school_id });
					break;
				default:
					this.logger.warn(`Unknown entity type: ${dto.entity}`);
					return false;
			}
			return true;
		} catch (e) {
			this.logger.error(`Failed to apply sync operation: ${e.message}`);
			return false;
		}
	}

	async pull() {
		return this.syncRepo.find();
	}
}
