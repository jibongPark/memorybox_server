import crypto from 'crypto';

type EncryptType = 'calendar' | 'trip';

const algorithm = 'aes-256-cbc';

function getKeyIv(type: EncryptType): { key: Buffer; iv: Buffer } {
    const upper = type.toUpperCase();
    const key = process.env[`${upper}_KEY`];
    const iv = process.env[`${upper}_IV`];
  
    if (!key || !iv) {
          throw new Error(`Missing key or iv for type: ${type}`);
    }
  
    return {
      key: Buffer.from(key, 'hex'),
      iv: Buffer.from(iv, 'hex'),
    };
}

export function encrypt(text: string, type: EncryptType): string {
    const { key, iv } = getKeyIv(type);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let enc = cipher.update(text, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

export function decrypt(encrypted: string, type: EncryptType): string {
    const { key, iv } = getKeyIv(type);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let dec = decipher.update(encrypted, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}