import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { ReportCardsRepository } from './report-cards.repository';
import { PrismaService } from '../core/prisma.service';

@Module({
  controllers: [NotesController],
  providers: [
    NotesService,
    NotesRepository,
    ReportCardsRepository,
    PrismaService,
  ],
  exports: [NotesService],
})
export class NotesModule {}
