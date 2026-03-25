import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage();
    this.bucketName = this.configService.get<string>('GCP_BUCKET_NAME') || 'default-bucket';
  }

  async uploadImage(filename: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.save(buffer, {
        contentType,
        resumable: false,
      });

      return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
    } catch (error: any) {
      this.logger.error(`Failed to upload to Cloud Storage: ${error.message}`);
      throw error;
    }
  }
}
