import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB default
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
];

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
      );
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private validate(
    bucket: string,
    path: string,
    file: Buffer,
    mimeType: string,
  ): void {
    if (path.includes('..')) {
      throw new BadRequestException(
        'Chemin de fichier invalide : détection de traversée de répertoire',
      );
    }
    const maxSize =
      parseInt(process.env.STORAGE_MAX_FILE_SIZE || '', 10) || MAX_FILE_SIZE;
    if (file.length > maxSize) {
      throw new PayloadTooLargeException(
        `File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }
    const allowed = (
      process.env.STORAGE_ALLOWED_MIME_TYPES || ALLOWED_MIME_TYPES.join(',')
    ).split(',');
    if (!allowed.includes(mimeType)) {
      throw new BadRequestException(
        `Le type de fichier "${mimeType}" n'est pas autorisé. Autorisés : ${allowed.join(', ')}`,
      );
    }
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    mimeType: string,
  ) {
    const targetBucket = bucket || process.env.STORAGE_BUCKET || 'documents';
    this.validate(targetBucket, path, file, mimeType);

    const { data, error } = await this.supabase.storage
      .from(targetBucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      const err = new Error(error.message || 'Storage upload failed');
      (err as Error & { status?: number }).status =
        typeof error.status === 'string'
          ? parseInt(error.status, 10)
          : error.status || 500;
      throw err;
    }
    return data;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    const targetBucket = bucket || process.env.STORAGE_BUCKET || 'documents';
    const { data, error } = await this.supabase.storage
      .from(targetBucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  getPublicUrl(bucket: string, path: string) {
    const targetBucket = bucket || process.env.STORAGE_BUCKET || 'documents';
    const { data } = this.supabase.storage
      .from(targetBucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  listBuckets() {
    return this.supabase.storage.listBuckets();
  }
}
