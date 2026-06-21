import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../core/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        school_id: dto.school_id,
        name: dto.name,
        phone: dto.phone,
        ...(dto.role && { role: dto.role as UserRole }),
      },
    });

    if (dto.school_id) {
      await this.prisma.userSchool.create({
        data: {
          user_id: user.id,
          school_id: dto.school_id,
          role: (dto.role as UserRole) || 'PARENT',
        },
      });
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const data: Partial<Record<string, unknown>> = {};
    if (dto.email) data.email = dto.email;
    if (dto.role) data.role = dto.role;
    if (dto.name) data.name = dto.name;
    if (dto.phone) data.phone = dto.phone;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.usersRepo.findByEmailGlobal(email);
  }

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async list(page = 1, pageSize = 20) {
    return this.prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
    });
  }

  async verifyPassword(user: { password: string }, password: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return bcrypt.compare(password, (user as Record<string, string>).password);
  }
}
