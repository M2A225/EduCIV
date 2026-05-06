import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repo: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findByEmailGlobal: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list users using repository find', async () => {
    const mockUsers = [{ id: 1, email: 'test@test.com' }];
    (repo.find as jest.Mock).mockResolvedValue(mockUsers);

    const result = await service.list(1, 20);
    expect(result).toEqual(mockUsers);
    expect(repo.find).toHaveBeenCalledWith({ skip: 0, take: 20 });
  });
});
