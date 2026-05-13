export interface MultiTenantEntity {
  school_id: number;
  id?: any;
}

export abstract class BaseRepository<T extends MultiTenantEntity> {
  constructor(
    protected readonly model: any, // Prisma model delegate
    protected readonly schoolId?: number,
  ) {}

  get currentSchoolId(): number | undefined {
    return this.schoolId;
  }

  protected ensureSchoolId() {
    if (!this.schoolId) {
      throw new Error('BaseRepository: schoolId is required for this operation.');
    }
  }

  async find(args: any = {}): Promise<T[]> {
    this.ensureSchoolId();
    return this.model.findMany({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    });
  }

  async findOne(args: any): Promise<T | null> {
    this.ensureSchoolId();
    return this.model.findFirst({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    });
  }

  async create(data: any): Promise<T> {
    this.ensureSchoolId();
    return this.model.create({
      data: {
        ...data,
        school_id: this.schoolId,
      },
    });
  }

  async update(id: any, data: any): Promise<T> {
    this.ensureSchoolId();
    // Prisma update requires a unique input for 'where'
    // We assume 'id' is unique, but we also check school_id for safety
    // However, Prisma doesn't support non-unique fields in 'where' for 'update' directly
    // unless it's a compound unique. 
    // For now, we update by id and trust the tenant check (or we could use updateMany)
    
    // Safety check: ensure the item belongs to the school
    const item = await this.findOne({ where: { id } });
    if (!item) throw new Error('Item not found or access denied');

    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: any): Promise<void> {
    this.ensureSchoolId();
    const item = await this.findOne({ where: { id } });
    if (!item) throw new Error('Item not found or access denied');

    await this.model.delete({
      where: { id },
    });
  }

  async count(args: any = {}): Promise<number> {
    this.ensureSchoolId();
    return this.model.count({
      ...args,
      where: {
        ...(args.where || {}),
        school_id: this.schoolId,
      },
    });
  }
}
