import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(args: any) {
    return this.prisma.refreshToken.findMany(args);
  }

  async findOne(args: any) {
    return this.prisma.refreshToken.findFirst(args);
  }

  async save(data: any) {
    return this.prisma.refreshToken.create({ data });
  }

  async delete(args: any) {
    return this.prisma.refreshToken.deleteMany({ where: args });
  }
}
