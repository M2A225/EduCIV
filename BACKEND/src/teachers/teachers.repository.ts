import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Teacher } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TeachersRepository extends BaseRepository<Teacher> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.teacher, request);
  }
}
