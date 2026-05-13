import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async processOperations(schoolId: string, operations: any[]) {
    const results: { id: string; status: string }[] = [];
    
    for (const op of operations) {
      // Vérifier idempotence
      const existing = await this.prisma.syncOperation.findUnique({
        where: { client_operation_id: op.client_operation_id }
      });

      if (!existing) {
        // Exécuter l'opération métier
        await this.prisma.syncOperation.create({
          data: {
            client_operation_id: op.client_operation_id,
            entity: op.entity,
            entity_id: op.entity_id,
            payload: JSON.stringify(op.payload),
            school_id: schoolId
          }
        });
        results.push({ id: op.client_operation_id, status: 'success' });
      } else {
        results.push({ id: op.client_operation_id, status: 'skipped' });
      }
    }
    return results;
  }
}
