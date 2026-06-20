import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(args?: Prisma.RefreshTokenFindManyArgs) {
    return this.prisma.refreshToken.findMany(args);
  }

  async findOne(args?: Prisma.RefreshTokenFindFirstArgs) {
    return this.prisma.refreshToken.findFirst(args);
  }

  async save(data: Prisma.RefreshTokenUncheckedCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  async delete(where: Prisma.RefreshTokenWhereInput) {
    return this.prisma.refreshToken.deleteMany({ where });
  }
}
