import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh_token.entity';
import { REDIS_CLIENT } from '../common/redis.provider';

const mockJwt = { 
  sign: jest.fn().mockReturnValue('token'), 
  verify: jest.fn().mockReturnValue({ sub: 1 }) 
};
const mockUsers = {
  findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'a', password: 'hashed', school_id: 'school_1' }),
  findById: jest.fn().mockResolvedValue({ id: 1, email: 'a', password: 'hashed', school_id: 'school_1' }),
  verifyPassword: jest.fn().mockResolvedValue(true),
};
const mockRefreshRepo = { 
  find: jest.fn().mockResolvedValue([]), 
  save: jest.fn().mockResolvedValue({}), 
  delete: jest.fn().mockResolvedValue({}), 
  findOne: jest.fn() 
};
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwt },
        { provide: UsersService, useValue: mockUsers },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshRepo },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login and return tokens', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockUsers.findByEmail.mockResolvedValue({ id: 1, email: 'a', school_id: 's1' });
    mockUsers.verifyPassword.mockResolvedValue(true);

    const result = await service.login('a', 'p');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(mockRedis.del).toHaveBeenCalledWith('attempts:a');
  });

  it('should block login after 5 failed attempts', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockUsers.verifyPassword.mockResolvedValue(false);
    mockRedis.incr.mockResolvedValue(5);

    await expect(service.login('a', 'p')).rejects.toThrow('Invalid credentials');
    expect(mockRedis.set).toHaveBeenCalledWith('block:a', '1', { ex: 900 });
  });
});
