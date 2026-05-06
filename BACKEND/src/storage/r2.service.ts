import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, GetObjectCommand, S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2Service {
  private client: S3Client;
  private bucket: string;
  private readonly logger = new Logger(R2Service.name);

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const region = this.configService.get<string>('R2_REGION', 'auto');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET', '');

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      this.logger.warn('Cloudflare R2 is not fully configured.');
      return;
    }

    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: 1 }));
      return true;
    } catch (e) {
      this.logger.error(`R2 connection failed: ${e.message}`);
      return false;
    }
  }

  async upload(key: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    return this.client.send(cmd);
  }

  async getObject(key: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return this.client.send(cmd);
  }
}
