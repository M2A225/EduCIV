import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.city.findMany({
      include: {
        communes: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        communes: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!city) throw new NotFoundException('Ville introuvable');
    return city;
  }

  async create(name: string) {
    const existing = await this.prisma.city.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Cette ville existe déjà');
    return this.prisma.city.create({ data: { name } });
  }

  async update(id: number, name: string) {
    await this.getById(id);
    return this.prisma.city.update({ where: { id }, data: { name } });
  }

  async delete(id: number) {
    await this.getById(id);
    return this.prisma.city.delete({ where: { id } });
  }

  async getCommunes(cityId: number) {
    await this.getById(cityId);
    return this.prisma.commune.findMany({
      where: { city_id: cityId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCommune(cityId: number, name: string) {
    await this.getById(cityId);
    return this.prisma.commune.create({ data: { name, city_id: cityId } });
  }

  async updateCommune(id: number, name: string) {
    const commune = await this.prisma.commune.findUnique({ where: { id } });
    if (!commune) throw new NotFoundException('Commune introuvable');
    return this.prisma.commune.update({ where: { id }, data: { name } });
  }

  async deleteCommune(id: number) {
    const commune = await this.prisma.commune.findUnique({ where: { id } });
    if (!commune) throw new NotFoundException('Commune introuvable');
    return this.prisma.commune.delete({ where: { id } });
  }
}
