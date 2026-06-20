import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSchoolGroupDto } from './dto/create-school-group.dto';
import { UpdateSchoolGroupDto } from './dto/update-school-group.dto';
import { SchoolGroupsRepository } from './school-groups.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class SchoolGroupsService {
  constructor(
    private readonly schoolGroupsRepo: SchoolGroupsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSchoolGroupDto) {
    return this.prisma.schoolGroup.create({
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        city: dto.city,
      },
    });
  }

  async list() {
    return this.prisma.schoolGroup.findMany({
      include: {
        schools: true,
      },
    });
  }

  async getById(id: number) {
    return this.prisma.schoolGroup.findUnique({
      where: { id },
      include: {
        schools: true,
      },
    });
  }

  async update(id: number, dto: UpdateSchoolGroupDto) {
    return this.prisma.schoolGroup.update({
      where: { id },
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        city: dto.city,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.schoolGroup.delete({ where: { id } });
  }

  async addSchool(groupId: number, schoolId: number) {
    return this.prisma.school.update({
      where: { id: schoolId },
      data: { school_group_id: groupId },
    });
  }

  async removeSchool(groupId: number, schoolId: number) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { school_group_id: true },
    });
    if (school?.school_group_id !== groupId) {
      throw new BadRequestException("Cette école n'appartient pas à ce groupe");
    }
    return this.prisma.school.update({
      where: { id: schoolId },
      data: { school_group_id: null },
    });
  }

  async getAvailableSchools() {
    return this.prisma.school.findMany({
      where: { school_group_id: null },
      select: { id: true, name: true, city: true, school_type: true },
      orderBy: { name: 'asc' },
    });
  }
}
