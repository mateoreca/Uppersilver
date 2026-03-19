import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecretManagerService } from './secret-manager/secret-manager.service';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [ConfigModule],
  providers: [SecretManagerService, StorageService],
  exports: [SecretManagerService, StorageService]
})
export class GcpModule {}
