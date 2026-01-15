import { 
  generateKeyPairSync, 
  randomBytes, 
  createHash, 
  createCipheriv, 
  createDecipheriv, 
  randomUUID 
} from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

interface CryptoRequestBody {
  action: 'generate' | 'hash' | 'encrypt' | 'decrypt';
  type?: string;     // e.g., 'rsa', 'sha256', 'aes-256-cbc'
  input?: string;    // text to hash or encrypt/decrypt
  secretKey?: string; // for encryption/decryption
  length?: number;
}

const ALGORITHM = 'aes-256-cbc';

// Security Limits to prevent DoS
const MAX_RSA_LENGTH = 4096;
const MAX_SECRET_LENGTH = 1024; // 1KB limit for random bytes
const MAX_INPUT_LENGTH = 65536; // 64KB limit for text input

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CryptoRequestBody;
    // eslint-disable-next-line prefer-const
    let { action, type, length, input, secretKey } = body;

    // Sanitize length
    if (length !== undefined) {
      length = Number(length);
      if (isNaN(length) || length < 0) {
        return NextResponse.json({ error: 'Invalid length parameter' }, { status: 400 });
      }
    }

    // Global Input Validation
    if (input && input.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (secretKey && secretKey.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Secret key exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    let result: Record<string, string> = {};

    switch (action) {
      case 'generate':
        if (type === 'rsa') {
          const modLength = length || 2048;
          if (modLength > MAX_RSA_LENGTH) {
             return NextResponse.json(
              { error: `RSA key length cannot exceed ${MAX_RSA_LENGTH} bits` },
              { status: 400 }
            );
          }
          const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: modLength,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          result = { publicKey, privateKey };
        } 
        else if (type === 'api-key') {
          result = { output: `pk_live_${randomBytes(24).toString('hex')}` };
        }
        else if (type === 'secret') {
          const byteLength = length || 64;
          if (byteLength > MAX_SECRET_LENGTH) {
            return NextResponse.json(
              { error: `Random bytes length cannot exceed ${MAX_SECRET_LENGTH}` },
              { status: 400 }
            );
          }
          result = { output: randomBytes(byteLength).toString('base64') };
        }
        else if (type === 'uuid') {
          result = { output: randomUUID() };
        }
        break;

      case 'hash':
        if (input && type) {
          const hash = createHash(type).update(input).digest('hex');
          result = { output: hash };
        }
        break;

      case 'encrypt':
        if (input && secretKey) {
          // Derive a 32-byte key from the secret
          const key = createHash('sha256').update(secretKey).digest();
          const iv = randomBytes(16);
          const cipher = createCipheriv(ALGORITHM, key, iv);
          let encrypted = cipher.update(input, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          // Return IV + Encrypted data
          result = { output: `${iv.toString('hex')}:${encrypted}` };
        }
        break;

      case 'decrypt':
        if (input && secretKey) {
          const [ivHex, encryptedText] = input.split(':');
          if (!ivHex || !encryptedText) throw new Error('Invalid encrypted format');
          
          const key = createHash('sha256').update(secretKey).digest();
          const iv = Buffer.from(ivHex, 'hex');
          const decipher = createDecipheriv(ALGORITHM, key, iv);
          let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          result = { output: decrypted };
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
