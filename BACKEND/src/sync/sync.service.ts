import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  constructor(private prisma: PrismaService) {}

  async processOperations(schoolId: string, operations: any[]) {
    const results: { id: string; status: string }[] = [];

    for (const op of operations) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const existing = await tx.syncOperation.findUnique({
            where: { client_operation_id: op.client_operation_id }
          });

          if (existing) {
            results.push({ id: op.client_operation_id, status: 'skipped' });
            return;
          }

          // Logique métier pour appliquer les changements
          await this.applyOperation(tx, op, schoolId);

          await tx.syncOperation.create({
            data: {
              client_operation_id: op.client_operation_id,
              entity: op.entity,
              entity_id: op.entity_id,
              payload: JSON.stringify(op.payload),
              school_id: Number(schoolId)
            }
          });
          results.push({ id: op.client_operation_id, status: 'success' });
        });
      } catch (error) {
        this.logger.error(`Failed to process op ${op.client_operation_id}`, error);
        results.push({ id: op.client_operation_id, status: 'error' });
      }
    }
    return results;
  }

  private async applyOperation(tx: any, op: any, schoolId: string) {
    const data = { ...op.payload, school_id: Number(schoolId) };
    
    switch (op.entity) {
      case 'STUDENT':
        if (op.type === 'CREATE') await tx.student.create({ data });
        if (op.type === 'UPDATE') await tx.student.update({ where: { id: parseInt(op.entity_id) }, data });
        break;
      case 'GRADE':
        if (op.type === 'CREATE') await tx.grade.create({ data });
        break;
      default:
        throw new Error(`Unknown entity: ${op.entity}`);
    }
  }
}
