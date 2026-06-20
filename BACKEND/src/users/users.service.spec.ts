import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../core/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: UsersRepository;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userSchool: {
      upsert: jest.fn(),
    },
  };

  const mockRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByEmailGlobal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list users using prisma findMany', async () => {
    const mockUsers = [{ id: 1, email: 'test@test.com' }];
    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    const result = await service.list(1, 20);
    expect(result).toEqual(mockUsers);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      orderBy: { id: 'desc' },
    });
  });
});
