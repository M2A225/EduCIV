const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args.join(' ');
  if (
    msg.includes('Redis connection failed') &&
    msg.includes('falling back to memory')
  ) {
    return;
  }
  originalWarn(...args);
};

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(true),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  })),
}));
