import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createDemoAccount, createDemoCredential, authenticateDemoAccount, getDemoLoginStatus, isValidDemoEmail, verifyDemoCredential } from '../src/auth-demo.mjs';

test('demo account credentials are derived, not stored as raw passwords', async () => {
  const password = 'sample-pass-9042';
  const credential = await createDemoCredential(password, webcrypto);
  assert.notEqual(credential.hash, password);
  assert.equal(await verifyDemoCredential(password, credential, webcrypto), true);
  assert.equal(await verifyDemoCredential('wrong-pass-0000', credential, webcrypto), false);
});

test('demo credential creation rejects passwords shorter than eight characters', async () => {
  await assert.rejects(() => createDemoCredential('short7', webcrypto), /8 characters/);
});

test('account creation is unique and login verifies the entered password', async () => {
  const profile = { name: 'Rina', email: 'Rina@example.com', phone: '0812345678' };
  const accounts = await createDemoAccount({}, profile, 'sample-pass-9042', webcrypto);
  const account = accounts['rina@example.com'];
  assert.equal(account.profile.name, 'Rina');
  assert.notEqual(account.credential.hash, 'sample-pass-9042');
  assert.equal((await authenticateDemoAccount(accounts, 'RINA@example.com', 'sample-pass-9042', webcrypto)).profile.email, 'rina@example.com');
  assert.equal(await authenticateDemoAccount(accounts, 'rina@example.com', 'incorrect-pass', webcrypto), null);
  await assert.rejects(() => createDemoAccount(accounts, profile, 'sample-pass-9042', webcrypto), /already exists/i);
});

test('email validation rejects an at-sign with no local part before it', () => {
  assert.equal(isValidDemoEmail('person@example.test'), true);
  assert.equal(isValidDemoEmail('@person@example.test'), false);
  assert.equal(isValidDemoEmail('@example.test'), false);
});

test('login status distinguishes missing account from wrong password', async () => {
  const accounts = await createDemoAccount({}, { name: 'Demo', email: 'person@example.test', phone: '' }, 'sample-pass-9042', webcrypto);
  assert.deepEqual(await getDemoLoginStatus(accounts, 'missing@example.test', 'sample-pass-9042', webcrypto), { status: 'not-found' });
  assert.deepEqual(await getDemoLoginStatus(accounts, 'person@example.test', 'incorrect-pass', webcrypto), { status: 'wrong-password' });
  const success = await getDemoLoginStatus(accounts, 'PERSON@example.test', 'sample-pass-9042', webcrypto);
  assert.equal(success.status, 'authenticated');
  assert.equal(success.account.profile.email, 'person@example.test');
});

test('signup works without SubtleCrypto in visibly unverified demo mode', async () => {
  const accounts = await createDemoAccount({}, { name: 'Demo', email: 'person@example.test', phone: '' }, 'sample-pass-9042', {});
  const account = accounts['person@example.test'];
  assert.equal(account.credential.mode, 'demo-unverified');
  assert.equal(Object.hasOwn(account, 'password'), false);
  assert.equal((await getDemoLoginStatus(accounts, 'person@example.test', 'sample-pass-9042', {})).status, 'authenticated');
  assert.equal((await getDemoLoginStatus(accounts, 'person@example.test', '', {})).status, 'wrong-password');
});
