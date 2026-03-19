import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretManagerService {
  private client: SecretManagerServiceClient;
  private readonly logger = new Logger(SecretManagerService.name);

  constructor() {
    this.client = new SecretManagerServiceClient();
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const [version] = await this.client.accessSecretVersion({
        name: secretName,
      });

      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error('Secret payload is empty');
      }
      return payload;
    } catch (error: any) {
      this.logger.error(`Failed to fetch secret ${secretName}: ${error.message}`);
      throw error;
    }
  }
}
