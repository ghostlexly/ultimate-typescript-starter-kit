import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { generateKeyPairSync } from 'crypto';

@Command({
  name: 'generate:jwt-keys',
  description: 'Generate RSA key pair for JWT authentication (base64 encoded)',
})
export class GenerateJwtKeysCommandRunner extends CommandRunner {
  private logger = new Logger(GenerateJwtKeysCommandRunner.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    try {
      this.logger.log('Generating RSA key pair for JWT...');

      // Generate RSA key pair
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      // Encode keys in base64
      const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
      const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

      // Display results
      this.logger.warn('✅ JWT Keys generated successfully!');
      this.logger.warn('Add these to your .env file:');
      this.logger.debug(`APP_JWT_PRIVATE_KEY="${privateKeyBase64}"`);
      this.logger.debug(`APP_JWT_PUBLIC_KEY="${publicKeyBase64}"`);
    } catch (error) {
      this.logger.error('Failed to generate JWT keys:', error);
      throw error;
    }
  }
}
