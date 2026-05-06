import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotesService } from './notes.service';
import { Note } from '../entities/note.entity';
import { NotesRepository } from './notes.repository';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: NotesRepository, useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(Note), useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
