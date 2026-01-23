import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-at-least-32-chars-long-123'; // Must be 256 bits (32 characters)
// Ensure the key is 32 bytes. If not, pad or slice it.
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  if (textParts.length < 2) throw new Error('Invalid encrypted format');
  
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function isBcryptHash(text: string): boolean {
    return text.startsWith('$2a$') || text.startsWith('$2b$') || text.startsWith('$2y$');
}
