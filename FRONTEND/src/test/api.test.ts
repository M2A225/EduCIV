import { describe, it, expect, beforeEach } from 'vitest';

describe('api service', () => {
  const TOKEN_MODULE = '../services/api';

  beforeEach(async () => {
    const mod: any = await import(TOKEN_MODULE);
    mod.setAccessToken(null);
  });

  it('should set and get access token from memory', async () => {
    const mod: any = await import(TOKEN_MODULE);
    expect(mod.getAccessToken()).toBeNull();
    mod.setAccessToken('test-token');
    expect(mod.getAccessToken()).toBe('test-token');
  });

  it('should clear token when set to null', async () => {
    const mod: any = await import(TOKEN_MODULE);
    mod.setAccessToken('test-token');
    mod.setAccessToken(null);
    expect(mod.getAccessToken()).toBeNull();
  });
});
