import { describe, it, expect } from 'vitest';

describe('extractData', () => {
  it('should extract data from ApiResponse', async () => {
    const { extractData } = await import('../lib/utils');
    const result = extractData<{ id: number }>({ data: { data: { id: 1 } } });
    expect(result).toEqual({ id: 1 });
  });
});
