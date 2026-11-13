import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDemoAccounts, saveDemoAccounts, DEMO_ACCOUNTS_STORAGE_KEY } from '../src/account-storage.mjs';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
  };
}

test('demo accounts can be loaded after creating a new app page instance', () => {
  const persistent = memoryStorage();
  const accounts = { 'user@example.com': { profile: { email: 'user@example.com' }, credential: { salt: 'salt', hash: 'hash' } } };
  assert.equal(saveDemoAccounts(accounts, persistent), true);
  assert.deepEqual(loadDemoAccounts(persistent), accounts);
  assert.ok(persistent.getItem(DEMO_ACCOUNTS_STORAGE_KEY));
});

test('older session accounts migrate to persistent browser storage', () => {
  const legacy = memoryStorage({ 'kandang-user-accounts-v1': JSON.stringify({ 'old@example.com': { profile: { email: 'old@example.com' } } }) });
  const persistent = memoryStorage();
  const accounts = loadDemoAccounts(persistent, { legacyStorage: legacy, legacyKey: 'kandang-user-accounts-v1' });
  assert.deepEqual(accounts, { 'old@example.com': { profile: { email: 'old@example.com' } } });
  assert.deepEqual(JSON.parse(persistent.getItem(DEMO_ACCOUNTS_STORAGE_KEY)), accounts);
});

test('invalid or unavailable storage safely returns no accounts', () => {
  const corrupted = memoryStorage({ 'kandang-user-accounts-v1': '{broken' });
  assert.deepEqual(loadDemoAccounts(corrupted), {});
  assert.deepEqual(loadDemoAccounts(null), {});
  assert.equal(saveDemoAccounts({}, null), false);
});
