import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { AuthRequest } from './auth.controller';

const mockAuthService = {
  login: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }),
  refresh: jest
    .fn()
    .mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' }),
  logout: jest.fn().mockResolvedValue(null),
  registerWithInvitation: jest
    .fn()
    .mockResolvedValue({ accessToken: 'a3', refreshToken: 'r3' }),
  linkInvitation: jest.fn().mockResolvedValue(undefined),
  getProfile: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  verifyInvitation: jest.fn().mockResolvedValue({ valid: true }),
  switchRole: jest
    .fn()
    .mockResolvedValue({ accessToken: 'a4', refreshToken: 'r4' }),
};

const mockRes = (): jest.Mocked<Partial<Response>> => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
}) as unknown as jest.Mocked<Partial<Response>>;

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with identifier and password', async () => {
      const res = mockRes();
      const result = await controller.login(
        { identifier: 'user@test.com', password: 'pass' },
        res as unknown as Response,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith('user@test.com', 'pass');
      expect(res.cookie).toHaveBeenCalled();
      expect(result.data.accessToken).toBe('a');
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with token from cookie', async () => {
      const req = { cookies: { refresh_token: 'rt' } };
      const res = mockRes();
      const result = await controller.refresh(
        req as unknown as AuthRequest,
        res as unknown as Response,
      );
      expect(mockAuthService.refresh).toHaveBeenCalledWith('rt');
      expect(res.cookie).toHaveBeenCalled();
      expect(result.data.accessToken).toBe('a2');
    });

    it('should throw UnauthorizedException when no cookie', async () => {
      const req = { cookies: {} };
      const res = mockRes();
      await expect(
        controller.refresh(req as unknown as AuthRequest, res as unknown as Response),
      ).rejects.toThrow('Aucun token de rafraîchissement');
    });
  });

  describe('logout', () => {
    it('should call authService.logout and clear cookie', async () => {
      const req = { cookies: { refresh_token: 'rt' } };
      const res = mockRes();
      const result = await controller.logout(
        req as unknown as AuthRequest,
        res as unknown as Response,
      );
      expect(mockAuthService.logout).toHaveBeenCalledWith('rt');
      expect(res.clearCookie).toHaveBeenCalled();
      expect(result.data).toBeNull();
    });

    it('should skip logout when no cookie', async () => {
      const req = { cookies: {} };
      const res = mockRes();
      const result = await controller.logout(
        req as unknown as AuthRequest,
        res as unknown as Response,
      );
      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(result.data).toBeNull();
    });
  });

  describe('registerWithInvitation', () => {
    it('should call authService.registerWithInvitation', async () => {
      const res = mockRes();
      const dto = { code: 'invite123', password: 'pass', name: 'Test' };
      const result = await controller.registerWithInvitation(
        dto,
        res as unknown as Response,
      );
      expect(mockAuthService.registerWithInvitation).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalled();
      expect(result.data.accessToken).toBe('a3');
    });
  });

  describe('linkInvitation', () => {
    it('should call authService.linkInvitation', async () => {
      const req = { user: { userId: 42 } };
      const result = await controller.linkInvitation(
        { code: 'invite456' },
        req as unknown as AuthRequest,
      );
      expect(mockAuthService.linkInvitation).toHaveBeenCalledWith(42, 'invite456');
      expect(result.data).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req as unknown as AuthRequest);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
      expect(result.data.name).toBe('Test');
    });
  });

  describe('verifyInvitation', () => {
    it('should call authService.verifyInvitation', async () => {
      const result = await controller.verifyInvitation('abc123');
      expect(mockAuthService.verifyInvitation).toHaveBeenCalledWith('abc123');
      expect(result.data.valid).toBe(true);
    });
  });
});
