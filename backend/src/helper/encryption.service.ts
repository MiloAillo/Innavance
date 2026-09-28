import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  
  constructor() {
    // Get encryption key from environment
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    // Validate key format and length (must be 64 hex characters = 32 bytes for AES-256)
    if (encryptionKey.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes for AES-256)');
    }
    
    if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
      throw new Error('ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)');
    }
    
    this.key = Buffer.from(encryptionKey, 'hex');
  }
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }
  
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
