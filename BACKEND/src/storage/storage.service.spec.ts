import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

const mockUpload = jest.fn();
const mockCreateSignedUrl = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockListBuckets = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
        getPublicUrl: mockGetPublicUrl,
      }),
      listBuckets: mockListBuckets,
    },
  }),
}));

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    service = new StorageService();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.STORAGE_MAX_FILE_SIZE;
    delete process.env.STORAGE_ALLOWED_MIME_TYPES;
    delete process.env.STORAGE_BUCKET;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if Supabase credentials not configured', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => new StorageService()).toThrow(
      'Supabase credentials not configured',
    );
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const fileBuffer = Buffer.from('test');
      mockUpload.mockResolvedValue({ data: { path: 'test.png' }, error: null });

      const result = await service.uploadFile(
        'documents',
        'test.png',
        fileBuffer,
        'image/png',
      );

      expect(result).toEqual({ path: 'test.png' });
    });

    it('should throw on upload error', async () => {
      const fileBuffer = Buffer.from('test');
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed', status: 500 },
      });

      await expect(
        service.uploadFile('documents', 'test.png', fileBuffer, 'image/png'),
      ).rejects.toThrow('Upload failed');
    });

    it('should throw BadRequestException for path traversal', async () => {
      const fileBuffer = Buffer.from('test');

      await expect(
        service.uploadFile(
          'documents',
          '../etc/passwd',
          fileBuffer,
          'image/png',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw PayloadTooLargeException for oversized files', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      await expect(
        service.uploadFile('documents', 'large.png', largeBuffer, 'image/png'),
      ).rejects.toThrow(PayloadTooLargeException);
    });

    it('should throw BadRequestException for disallowed mime type', async () => {
      const fileBuffer = Buffer.from('test');

      await expect(
        service.uploadFile(
          'documents',
          'test.exe',
          fileBuffer,
          'application/x-executable',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use default bucket if none provided', async () => {
      const fileBuffer = Buffer.from('test');
      mockUpload.mockResolvedValue({ data: { path: 'test.png' }, error: null });

      await service.uploadFile('', 'test.png', fileBuffer, 'image/png');

      expect(mockUpload).toHaveBeenCalled();
    });
  });

  describe('getSignedUrl', () => {
    it('should return a signed URL', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed.url' },
        error: null,
      });

      const result = await service.getSignedUrl('documents', 'test.png');

      expect(result).toBe('https://signed.url');
    });

    it('should throw on error', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      await expect(
        service.getSignedUrl('documents', 'missing.png'),
      ).rejects.toThrow('Not found');
    });
  });

  describe('getPublicUrl', () => {
    it('should return a public URL', async () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://public.url' },
      });

      const result = service.getPublicUrl('documents', 'test.png');

      expect(result).toBe('https://public.url');
    });
  });

  describe('listBuckets', () => {
    it('should list all buckets', async () => {
      const buckets = [{ name: 'documents' }, { name: 'avatars' }];
      mockListBuckets.mockResolvedValue({ data: buckets, error: null });

      const result = await service.listBuckets();

      expect(result).toEqual({ data: buckets, error: null });
    });
  });
});
