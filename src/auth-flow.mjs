import { authenticateDemoAccount, createDemoAccount, isValidDemoEmail } from './auth-demo.mjs?v=user-app-33';
import { loginUser, updateProfile } from './state.mjs?v=user-app-33';

export function startDemoPreview(state) {
  const profile = { name: 'Pengguna Demo', email: 'demo@kandang.test', phone: '' };
  return {
    state: updateProfile(loginUser(state, profile.email), profile),
    route: '#/home',
  };
}

export function navigateToAppRoute(location, render, route) {
  location.hash = route;
  render();
  return route;
}

export function validateSignupInput(profile, password, confirmation) {
  if (!String(profile?.name ?? '').trim()) return 'name-required';
  if (!isValidDemoEmail(profile?.email)) return 'email-invalid';
  if (typeof password !== 'string' || password.length < 8) return 'password-too-short';
  if (password !== confirmation) return 'password-mismatch';
  return null;
}

export async function createAccountSession(state, accounts, profile, password, confirmation, cryptoApi = globalThis.crypto) {
  if (password !== confirmation) throw new Error('Passwords do not match');
  const email = String(profile.email ?? '').trim().toLowerCase();
  let nextAccounts = accounts;
  let created = true;

  try {
    nextAccounts = await createDemoAccount(accounts, { ...profile, email }, password, cryptoApi);
  } catch (error) {
    if (!error.message.includes('already exists')) throw error;
    const existingAccount = await authenticateDemoAccount(accounts, email, password, cryptoApi);
    if (!existingAccount) throw error;
    created = false;
  }

  const account = nextAccounts[email];
  if (!account) throw new Error('Account could not be loaded');
  const authenticatedState = updateProfile(loginUser(state, email), account.profile);
  return {
    accounts: nextAccounts,
    state: authenticatedState,
    route: '#/home',
    created,
  };
}

export async function resetDemoAccountSession(state, accounts, profile, password, confirmation, cryptoApi = globalThis.crypto) {
  if (password !== confirmation) throw new Error('Passwords do not match');
  const email = String(profile.email ?? '').trim().toLowerCase();
  if (!accounts[email]) throw new Error('No existing account to reset');

  const accountsWithoutOldRecord = { ...accounts };
  delete accountsWithoutOldRecord[email];
  const nextAccounts = await createDemoAccount(
    accountsWithoutOldRecord,
    { ...profile, email },
    password,
    cryptoApi,
  );
  const account = nextAccounts[email];
  return {
    accounts: nextAccounts,
    state: updateProfile(loginUser(state, email), account.profile),
    route: '#/home',
    created: true,
  };
}
