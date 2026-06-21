import type { RequestWithUser } from '../auth/types';

export interface MultiTenantEntity {
  school_id: number | null;
  id?: number | null;
}

type PrismaDelegate = {
  findMany: (...args: unknown[]) => Promise<unknown>;
  findFirst: (...args: unknown[]) => Promise<unknown>;
  create: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
  delete: (...args: unknown[]) => Promise<unknown>;
  count: (...args: unknown[]) => Promise<unknown>;
};

export abstract class BaseRepository<T extends MultiTenantEntity> {
  constructor(
    protected readonly model: PrismaDelegate,
    protected readonly request?: RequestWithUser,
  ) {}

  protected get schoolId(): number | undefined {
    const user = this.request?.user;
    if (!user) return undefined;

    const headerId = this.request?.headers?.['x-school-id'];
    if (headerId) {
      const sid = Number(headerId);
      if (!isNaN(sid) && user.school_ids?.includes(sid)) {
        return sid;
      }
    }
    return user.currentSchoolId ?? user.primary_school_id ?? user.school_id;
  }

  get currentSchoolId(): number | undefined {
    return this.schoolId;
  }

  protected ensureSchoolId() {
    if (!this.schoolId) {
      throw new Error(
        'BaseRepository: schoolId is required for this operation.',
      );
    }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  find(args: any = {}): Promise<T[]> {
    this.ensureSchoolId();
    return this.model.findMany({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    }) as Promise<T[]>;
  }

  findMany(args: any = {}): Promise<T[]> {
    return this.find(args);
  }

  findOne(args: any): Promise<T | null> {
    this.ensureSchoolId();
    return this.model.findFirst({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    }) as Promise<T | null>;
  }

  create(data: any): Promise<T> {
    this.ensureSchoolId();
    return this.model.create({
      data: {
        ...data,
        school_id: this.schoolId,
      },
    }) as Promise<T>;
  }

  async update(id: any, data: any): Promise<T> {
    this.ensureSchoolId();
    const item = await this.findOne({ where: { id } });
    if (!item) throw new Error('Item not found or access denied');

    return this.model.update({
      where: { id },
      data,
    }) as Promise<T>;
  }

  async delete(id: number): Promise<void> {
    this.ensureSchoolId();
    const item = await this.findOne({ where: { id } });
    if (!item) throw new Error('Item not found or access denied');

    await this.model.delete({
      where: { id },
    });
  }

  count(args: any = {}): Promise<number> {
    this.ensureSchoolId();
    return this.model.count({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    }) as Promise<number>;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
}
