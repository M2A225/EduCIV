import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { SyncEntity } from '@prisma/client';

export interface SyncOperationInput {
  client_operation_id: string;
  entity: string;
  entity_id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
}

interface SyncTx {
  student: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  grade: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  payment: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  attendance: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  incident: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  teacher: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  class: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  subject: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  timetable: {
    create(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  syncOperation: { createMany(args: unknown): Promise<unknown> };
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  constructor(private prisma: PrismaService) {}

  async processOperations(schoolId: number, operations: SyncOperationInput[]) {
    const results: { id: string; status: string }[] = [];
    const opsToCreate: {
      client_operation_id: string;
      entity: SyncEntity;
      entity_id: string;
      payload: string;
      school_id: number;
    }[] = [];

    const clientIds = operations.map((o) => o.client_operation_id);
    const existingOps = await this.prisma.syncOperation.findMany({
      where: { client_operation_id: { in: clientIds } },
      select: { client_operation_id: true },
    });
    const existingIds = new Set(existingOps.map((o) => o.client_operation_id));

    await this.prisma.$transaction(async (tx) => {
      for (const op of operations) {
        if (existingIds.has(op.client_operation_id)) {
          results.push({ id: op.client_operation_id, status: 'skipped' });
          continue;
        }

        try {
          await this.applyOperation(tx, op, schoolId);
          opsToCreate.push({
            client_operation_id: op.client_operation_id,
            entity: op.entity as SyncEntity,
            entity_id: op.entity_id,
            payload: JSON.stringify(op.payload),
            school_id: Number(schoolId),
          });
          results.push({ id: op.client_operation_id, status: 'success' });
        } catch (error) {
          this.logger.error(
            `Failed to process op ${op.client_operation_id}`,
            error,
          );
          results.push({ id: op.client_operation_id, status: 'error' });
        }
      }

      if (opsToCreate.length > 0) {
        await tx.syncOperation.createMany({ data: opsToCreate });
      }
    });

    return results;
  }

  async pullData(schoolId: number, since?: string) {
    const where: Record<string, unknown> = { school_id: schoolId };
    if (since) {
      where.updated_at = { gte: new Date(since) };
    }

    const [students, grades, payments, attendances, incidents, timetables] =
      await Promise.all([
        this.prisma.student.findMany({ where, include: { class: true } }),
        this.prisma.grade.findMany({
          where,
          include: { subject: true, period: true },
        }),
        this.prisma.payment.findMany({ where, include: { student: true } }),
        this.prisma.attendance.findMany({ where, include: { session: true } }),
        this.prisma.incident.findMany({ where }),
        this.prisma.timetable.findMany({
          where,
          include: { class: true, teacher: true, subject: true },
        }),
      ]);

    return {
      students,
      grades,
      payments,
      attendances,
      incidents,
      timetables,
      synced_at: new Date().toISOString(),
    };
  }

  private async applyOperation(
    tx: SyncTx,
    op: SyncOperationInput,
    schoolId: number,
  ) {
    const data = { ...op.payload, school_id: Number(schoolId) };

    switch (op.entity) {
      case 'STUDENT':
        if (op.type === 'CREATE') await tx.student.create({ data });
        if (op.type === 'UPDATE')
          await tx.student.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'GRADE':
        if (op.type === 'CREATE') await tx.grade.create({ data });
        if (op.type === 'UPDATE')
          await tx.grade.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'PAYMENT':
        if (op.type === 'CREATE') await tx.payment.create({ data });
        if (op.type === 'UPDATE')
          await tx.payment.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'ATTENDANCE':
        if (op.type === 'CREATE') await tx.attendance.create({ data });
        if (op.type === 'UPDATE')
          await tx.attendance.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'INCIDENT':
        if (op.type === 'CREATE') await tx.incident.create({ data });
        if (op.type === 'UPDATE')
          await tx.incident.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'TEACHER':
        if (op.type === 'CREATE') await tx.teacher.create({ data });
        if (op.type === 'UPDATE')
          await tx.teacher.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'CLASS':
        if (op.type === 'CREATE') await tx.class.create({ data });
        if (op.type === 'UPDATE')
          await tx.class.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'SUBJECT':
        if (op.type === 'CREATE') await tx.subject.create({ data });
        if (op.type === 'UPDATE')
          await tx.subject.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      case 'TIMETABLE':
        if (op.type === 'CREATE') await tx.timetable.create({ data });
        if (op.type === 'UPDATE')
          await tx.timetable.update({
            where: { id: parseInt(op.entity_id) },
            data,
          });
        break;
      default:
        throw new Error(`Unknown entity: ${op.entity}`);
    }
  }
}
