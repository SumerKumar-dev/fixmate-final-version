export const LOCAL_ACCOUNTS_STORAGE_KEY = 'fixmate_local_accounts_v1';

const PASSWORD_HASH_ITERATIONS = 600000;
const PASSWORD_HASH_LENGTH = 256;
const PASSWORD_SALT_LENGTH = 16;

function readAccounts() {
  const raw = localStorage.getItem(LOCAL_ACCOUNTS_STORAGE_KEY);
  if (!raw) return [];

  const accounts = JSON.parse(raw);
  if (
    !Array.isArray(accounts) ||
    accounts.some(
      (account) =>
        !account ||
        typeof account.id !== 'string' ||
        typeof account.email !== 'string' ||
        typeof account.passwordSalt !== 'string' ||
        typeof account.passwordHash !== 'string' ||
        !['Customer', 'Service Provider'].includes(account.role)
    )
  ) {
    throw new Error('FixMate account storage is invalid. Please check this browser’s local data.');
  }
  return accounts;
}

function bytesToBase64(bytes) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function hashPassword(password, salt, iterations = PASSWORD_HASH_ITERATIONS) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Secure password hashing is unavailable. Open FixMate from localhost or HTTPS.');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    PASSWORD_HASH_LENGTH
  );
  return bytesToBase64(new Uint8Array(bits));
}

function createAccountSummary(account) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    role: account.role,
    providerId: account.providerId || '',
    providerCategory: account.providerCategory || '',
    providerCity: account.providerCity || '',
    providerPrice: account.providerPrice || 0,
  };
}

export async function registerLocalAccount({
  fullName,
  email,
  phone,
  password,
  role,
  providerCategory = '',
  providerCity = '',
  providerPrice = 0,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = String(phone || '').trim();
  const accounts = readAccounts();

  if (
    accounts.some(
      (account) =>
        account.email.toLowerCase() === normalizedEmail || account.phone === normalizedPhone
    )
  ) {
    return { ok: false, error: 'An account with this email address or mobile number already exists.' };
  }

  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_LENGTH));
  const passwordHash = await hashPassword(password, salt);
  const providerId =
    role === 'Service Provider'
      ? `local:${bytesToHex(crypto.getRandomValues(new Uint8Array(16)))}`
      : '';
  const account = {
    id: role === 'Customer' ? normalizedEmail : `provider:${providerId}`,
    fullName: String(fullName || '').trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    role,
    providerId,
    providerCategory: role === 'Service Provider' ? providerCategory : '',
    providerCity: role === 'Service Provider' ? String(providerCity || '').trim() : '',
    providerPrice: role === 'Service Provider' ? Number(providerPrice) : 0,
    passwordSalt: bytesToBase64(salt),
    passwordHash,
    passwordIterations: PASSWORD_HASH_ITERATIONS,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, account]));
  } catch {
    throw new Error('Chrome could not save the account. Check available browser storage and try again.');
  }
  return { ok: true, account: createAccountSummary(account) };
}

export async function authenticateLocalAccount(identifier, password) {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const account = readAccounts().find(
    (item) =>
      item.email.toLowerCase() === normalizedIdentifier ||
      item.phone === normalizedIdentifier
  );
  if (!account) return null;

  const iterations = Number(account.passwordIterations);
  if (!Number.isInteger(iterations) || iterations < 10000 || iterations > 1000000) {
    throw new Error('This account’s password record is invalid. Register again in this browser.');
  }
  const candidateHash = await hashPassword(
    password,
    base64ToBytes(account.passwordSalt),
    iterations
  );
  return candidateHash === account.passwordHash ? createAccountSummary(account) : null;
}

export function getLocalProviderProfile(providerId) {
  const account = readAccounts().find(
    (item) => item.providerId === providerId && item.role === 'Service Provider'
  );
  if (!account) return null;
  return {
    id: account.providerId,
    name: account.fullName,
    category: account.providerCategory,
    location: account.providerCity,
    price: account.providerPrice,
    phone: account.phone,
    email: account.email,
  };
}
