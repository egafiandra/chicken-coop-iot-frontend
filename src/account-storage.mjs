export const DEMO_ACCOUNTS_STORAGE_KEY = 'kandang-user-accounts-v1';

function readAccounts(storage, key) {
  try {
    const value = storage?.getItem(key);
    if (!value) return null;
    const accounts = JSON.parse(value);
    return accounts && typeof accounts === 'object' && !Array.isArray(accounts) ? accounts : null;
  } catch {
    return null;
  }
}

export function loadDemoAccounts(storage, { legacyStorage = null, legacyKey = DEMO_ACCOUNTS_STORAGE_KEY } = {}) {
  const saved = readAccounts(storage, DEMO_ACCOUNTS_STORAGE_KEY);
  if (saved && Object.keys(saved).length > 0) return saved;

  const legacy = readAccounts(legacyStorage, legacyKey);
  if (legacy && Object.keys(legacy).length > 0) {
    saveDemoAccounts(legacy, storage);
    return legacy;
  }
  return saved || {};
}

export function saveDemoAccounts(accounts, storage) {
  if (!storage || !accounts || typeof accounts !== 'object' || Array.isArray(accounts)) return false;
  try {
    storage.setItem(DEMO_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    return true;
  } catch {
    return false;
  }
}
