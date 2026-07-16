const crypto = require('crypto');

// Reversible encryption for stored account passwords.
//
// A password manager must be able to SHOW a user their saved password, so these
// secrets are encrypted (AES-256-GCM), not hashed. GCM is authenticated, so a
// tampered or wrong-key ciphertext fails loudly on decrypt instead of returning
// garbage. (User *login* passwords are still one-way hashed elsewhere — those
// never need to be revealed.)

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;     // 96-bit nonce, the size recommended for GCM
const SCHEME = 'gcmv1';  // versioned header, so the on-disk format can evolve

let cachedKey;

// Load and validate the 32-byte key once, on first use. It is base64-encoded in
// the environment so it round-trips cleanly through .env and Docker Compose.
function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.ACCOUNT_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('ACCOUNT_ENCRYPTION_KEY is not set; cannot encrypt account passwords');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('ACCOUNT_ENCRYPTION_KEY must decode to 32 bytes (a base64-encoded 256-bit key)');
  }
  cachedKey = key;
  return cachedKey;
}

// True when a stored value is ciphertext this module produced. Lets reads
// tolerate any legacy plaintext (e.g. the demo seed data) still in the table.
function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(`${SCHEME}:`);
}

// Returns "gcmv1:<iv>:<authTag>:<ciphertext>", all base64.
function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [SCHEME, iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

function decrypt(payload) {
  // Pass through anything not in our format (legacy plaintext rows).
  if (!isEncrypted(payload)) return payload;
  const [, ivB64, tagB64, dataB64] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt, isEncrypted };
