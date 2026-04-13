// =============================================
// Encryption Helpers: AES-256-GCM
// =============================================

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

/**
 * Obtener la clave de encriptación desde env
 * IMPORTANTE: Debe estar en .env como SALES_ENCRYPTION_KEY (hex de 64 caracteres)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.SALES_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'SALES_ENCRYPTION_KEY no está configurada en variables de entorno'
    );
  }

  // Validar que sea hex válido de 64 caracteres (32 bytes)
  if (key.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      'SALES_ENCRYPTION_KEY debe ser una cadena hexadecimal de 64 caracteres (32 bytes)'
    );
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encriptar texto usando AES-256-GCM
 * @param text - Texto plano a encriptar
 * @returns Texto encriptado en formato: iv:authTag:encrypted (hex)
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('El texto a encriptar no puede estar vacío');
  }

  const key = getEncryptionKey();

  // Generar IV aleatorio (12 bytes para GCM)
  const iv = crypto.randomBytes(12);

  // Crear cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encriptar
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Obtener auth tag (16 bytes para GCM)
  const authTag = cipher.getAuthTag();

  // Formato: iv:authTag:encrypted (todo en hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Desencriptar texto usando AES-256-GCM
 * @param encryptedText - Texto encriptado en formato: iv:authTag:encrypted
 * @returns Texto plano desencriptado
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('El texto a desencriptar no puede estar vacío');
  }

  const key = getEncryptionKey();

  // Separar componentes
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error(
      'Formato de texto encriptado inválido. Debe ser: iv:authTag:encrypted'
    );
  }

  const [ivHex, authTagHex, encrypted] = parts;

  // Convertir de hex a Buffer
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  // Validar tamaños
  if (iv.length !== 12) {
    throw new Error('IV debe ser de 12 bytes');
  }
  if (authTag.length !== 16) {
    throw new Error('Auth tag debe ser de 16 bytes');
  }

  // Crear decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Desencriptar
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generar una nueva clave de encriptación (para setup inicial)
 * @returns Clave hex de 64 caracteres (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Verificar si un texto está encriptado con el formato correcto
 * @param text - Texto a verificar
 * @returns true si tiene el formato iv:authTag:encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;

  const parts = text.split(':');
  if (parts.length !== 3) return false;

  const [ivHex, authTagHex, encrypted] = parts;

  // Verificar que sean hex válidos
  const hexRegex = /^[0-9a-fA-F]+$/;
  return (
    hexRegex.test(ivHex) &&
    hexRegex.test(authTagHex) &&
    hexRegex.test(encrypted) &&
    ivHex.length === 24 && // 12 bytes = 24 hex chars
    authTagHex.length === 32 // 16 bytes = 32 hex chars
  );
}

/**
 * Hash de token usando SHA-256 (para auth_token_hash)
 * @param token - Token a hashear
 * @returns Hash hex
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verificar token contra hash
 * @param token - Token en texto plano
 * @param hash - Hash almacenado
 * @returns true si coincide
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}
