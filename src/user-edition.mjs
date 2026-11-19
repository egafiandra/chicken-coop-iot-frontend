export const USER_EDITION_STORAGE_KEY = 'smart-poultry-user-edition-v1';

export function normalizeUserEdition(value) {
  return value === 'pro' ? 'pro' : 'lite';
}

export function readUserEdition(storage) {
  try {
    return normalizeUserEdition(storage?.getItem(USER_EDITION_STORAGE_KEY));
  } catch {
    return 'lite';
  }
}

export function writeUserEdition(storage, edition) {
  try {
    if (!storage) return false;
    storage.setItem(USER_EDITION_STORAGE_KEY, normalizeUserEdition(edition));
    return true;
  } catch {
    return false;
  }
}
