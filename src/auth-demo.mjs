const ITERATIONS = 120_000;
const SALT_LENGTH = 16;

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
  if (typeof value !== 'string' || value.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(value)) {
    throw new Error('Invalid credential format');
  }
  return new Uint8Array(value.match(/.{2}/g).map((pair) => Number.parseInt(pair, 16)));
}

async function deriveHash(password, salt, cryptoApi) {
  const key = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await cryptoApi.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: ITERATIONS,
    hash: 'SHA-256',
  }, key, 256);
  return new Uint8Array(bits);
}

export async function createDemoCredential(password, cryptoApi = globalThis.crypto) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!cryptoApi?.subtle || !cryptoApi?.getRandomValues) {
    throw new Error('Secure browser crypto is unavailable');
  }
  const salt = cryptoApi.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveHash(password, salt, cryptoApi);
  return { salt: toHex(salt), hash: toHex(hash), iterations: ITERATIONS };
}

export async function verifyDemoCredential(password, credential, cryptoApi = globalThis.crypto) {
  if (credential?.mode === 'demo-unverified') return typeof password === 'string' && password.length >= 8;
  if (typeof password !== 'string' || !credential || !cryptoApi?.subtle) return false;
  try {
    const salt = fromHex(credential.salt);
    const expected = fromHex(credential.hash);
    const actual = await deriveHash(password, salt, cryptoApi);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index += 1) {
      difference |= actual[index] ^ expected[index];
    }
    return difference === 0;
  } catch {
    return false;
  }
}

export function isValidDemoEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

export async function createDemoAccount(accounts, profile, password, cryptoApi = globalThis.crypto) {
  const name = String(profile.name ?? '').trim();
  const email = String(profile.email ?? '').trim().toLowerCase();
  const phone = String(profile.phone ?? '').trim();
  if (!name || name.length > 80) throw new Error('Enter a valid name');
  if (!isValidDemoEmail(email)) throw new Error('Enter a valid email');
  if (phone.length > 30) throw new Error('Enter a valid phone number');
  if (typeof password !== 'string' || password.length < 8) throw new Error('Password must be at least 8 characters');
  if (accounts[email]) throw new Error('An account with this email already exists');
  const cryptoAvailable = Boolean(cryptoApi?.subtle && cryptoApi?.getRandomValues);
  const credential = cryptoAvailable
    ? await createDemoCredential(password, cryptoApi)
    : { mode: 'demo-unverified' };
  return {
    ...accounts,
    [email]: { profile: { name, email, phone }, credential },
  };
}

export async function authenticateDemoAccount(accounts, email, password, cryptoApi = globalThis.crypto) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const account = accounts[normalizedEmail];
  if (!account) return null;
  return await verifyDemoCredential(password, account.credential, cryptoApi) ? account : null;
}

export async function getDemoLoginStatus(accounts, email, password, cryptoApi = globalThis.crypto) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const account = accounts[normalizedEmail];
  if (!account) return { status: 'not-found' };
  if (!await verifyDemoCredential(password, account.credential, cryptoApi)) {
    return { status: 'wrong-password' };
  }
  return { status: 'authenticated', account };
}
