import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SyncService } from './sync.service';
import { SyncOperation } from '../entities/sync_operation.entity';
import { SyncRepository } from './sync.repository';

describe('SyncService', () => {
  let service: SyncService;
  let repo: Repository<SyncOperation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: SyncRepository, useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
        { provide: DataSource, useValue: { isInitialized: true } },
        { provide: getRepositoryToken(SyncOperation), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    repo = module.get<Repository<SyncOperation>>(getRepositoryToken(SyncOperation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
