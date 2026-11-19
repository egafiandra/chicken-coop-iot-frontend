import test from 'node:test';
import assert from 'node:assert/strict';
import {
  USER_EDITION_STORAGE_KEY,
  normalizeUserEdition,
  readUserEdition,
  writeUserEdition,
} from '../src/user-edition.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    values,
  };
}

test('defaults to Lite for missing or invalid preferences', () => {
  const storage = memoryStorage();
  assert.equal(USER_EDITION_STORAGE_KEY, 'smart-poultry-user-edition-v1');
  assert.equal(readUserEdition(storage), 'lite');
  assert.equal(normalizeUserEdition('unknown'), 'lite');
  assert.equal(readUserEdition(memoryStorage({ [USER_EDITION_STORAGE_KEY]: 'unknown' })), 'lite');
  assert.equal(readUserEdition(memoryStorage({ [USER_EDITION_STORAGE_KEY]: '' })), 'lite');
});

test('reads a saved Pro preference', () => {
  assert.equal(normalizeUserEdition('pro'), 'pro');
  assert.equal(readUserEdition(memoryStorage({ [USER_EDITION_STORAGE_KEY]: 'pro' })), 'pro');
});

test('writes only normalized edition values', () => {
  const storage = memoryStorage();
  assert.equal(writeUserEdition(storage, 'pro'), true);
  assert.equal(storage.values.get(USER_EDITION_STORAGE_KEY), 'pro');
  assert.equal(writeUserEdition(storage, 'unknown'), true);
  assert.equal(storage.values.get(USER_EDITION_STORAGE_KEY), 'lite');
});

test('handles unavailable or throwing storage safely', () => {
  assert.equal(readUserEdition(null), 'lite');
  assert.equal(writeUserEdition(null, 'pro'), false);
  assert.equal(readUserEdition({ getItem() { throw new Error('blocked'); } }), 'lite');
  assert.equal(writeUserEdition({ setItem() { throw new Error('blocked'); } }, 'pro'), false);
});
