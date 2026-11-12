import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createInitialState } from '../src/state.mjs';
import { createAccountSession, navigateToAppRoute, resetDemoAccountSession, startDemoPreview, validateSignupInput } from '../src/auth-flow.mjs';

const profile = { name: 'Test User', email: 'person@example.com', phone: '' };
const password = 'session-test-pass-9042';

test('new signup creates the account, authenticates it, and selects the home route', async () => {
  const result = await createAccountSession(createInitialState(), {}, profile, password, password, webcrypto);
  assert.equal(result.created, true);
  assert.equal(result.state.isAuthenticated, true);
  assert.equal(result.state.profile.email, 'person@example.com');
  assert.equal(result.state.profile.name, 'Test User');
  assert.equal(result.route, '#/home');
  assert.notEqual(result.accounts['person@example.com'].credential.hash, password);
});

test('resubmitting an existing account with its correct password signs in and goes home', async () => {
  const first = await createAccountSession(createInitialState(), {}, profile, password, password, webcrypto);
  const resumed = await createAccountSession(createInitialState(), first.accounts, profile, password, password, webcrypto);
  assert.equal(resumed.created, false);
  assert.equal(resumed.state.isAuthenticated, true);
  assert.equal(resumed.state.profile.email, 'person@example.com');
  assert.equal(resumed.route, '#/home');
});

test('an existing email with a wrong password remains rejected', async () => {
  const first = await createAccountSession(createInitialState(), {}, profile, password, password, webcrypto);
  await assert.rejects(
    () => createAccountSession(createInitialState(), first.accounts, profile, 'different-test-pass-9042', 'different-test-pass-9042', webcrypto),
    /already exists/i,
  );
});

test('signup rejects mismatched password confirmation', async () => {
  await assert.rejects(
    () => createAccountSession(createInitialState(), {}, profile, password, 'different-test-pass-9042', webcrypto),
    /passwords do not match/i,
  );
});

test('explicit demo account reset replaces a forgotten password and enters home', async () => {
  const first = await createAccountSession(createInitialState(), {}, profile, password, password, webcrypto);
  const newPassword = 'reset-demo-pass-7251';
  const result = await resetDemoAccountSession(createInitialState(), first.accounts, profile, newPassword, newPassword, webcrypto);
  assert.equal(result.state.isAuthenticated, true);
  assert.equal(result.state.profile.email, 'person@example.com');
  assert.equal(result.route, '#/home');
  assert.equal(result.created, true);
  assert.notEqual(result.accounts['person@example.com'].credential.hash, first.accounts['person@example.com'].credential.hash);
});

test('demo account reset requires an existing account and matching confirmation', async () => {
  await assert.rejects(() => resetDemoAccountSession(createInitialState(), {}, profile, password, password, webcrypto), /existing account/i);
  const first = await createAccountSession(createInitialState(), {}, profile, password, password, webcrypto);
  await assert.rejects(() => resetDemoAccountSession(createInitialState(), first.accounts, profile, password, 'different-test-pass-9042', webcrypto), /passwords do not match/i);
});

test('signup validation returns a visible reason for each blocked input', () => {
  assert.equal(validateSignupInput({ name: '', email: 'person@example.test' }, password, password), 'name-required');
  assert.equal(validateSignupInput({ name: 'Test', email: '@person@example.test' }, password, password), 'email-invalid');
  assert.equal(validateSignupInput({ name: 'Test', email: 'person@example.test' }, 'short', 'short'), 'password-too-short');
  assert.equal(validateSignupInput({ name: 'Test', email: 'person@example.test' }, password, 'different-pass-9042'), 'password-mismatch');
  assert.equal(validateSignupInput(profile, password, password), null);
});

test('app route renders immediately after signup changes the hash', () => {
  const location = { hash: '#/signup' };
  let renderCount = 0;
  const route = navigateToAppRoute(location, () => { renderCount += 1; }, '#/home');
  assert.equal(route, '#/home');
  assert.equal(location.hash, '#/home');
  assert.equal(renderCount, 1);
});

test('signup completes in unverified demo mode when SubtleCrypto is unavailable', async () => {
  const result = await createAccountSession(createInitialState(), {}, profile, password, password, {});
  assert.equal(result.state.isAuthenticated, true);
  assert.equal(result.route, '#/home');
  assert.equal(result.accounts['person@example.com'].credential.mode, 'demo-unverified');
  assert.equal(Object.hasOwn(result.accounts['person@example.com'], 'password'), false);
});

test('demo preview enters the user app without creating stored credentials', () => {
  const result = startDemoPreview(createInitialState());
  assert.equal(result.state.isAuthenticated, true);
  assert.equal(result.state.profile.name, 'Pengguna Demo');
  assert.equal(result.state.profile.email, 'demo@kandang.test');
  assert.equal(result.route, '#/home');
  assert.equal('password' in result.state, false);
});
