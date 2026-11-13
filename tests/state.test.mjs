import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  getHomeDashboardModel,
  loginUser,
  logoutUser,
  markAllNotificationsRead,
  markNotificationRead,
  normalizePage,
  setMusicVolume,
  toggleControl,
  unreadCount,
  updateProfile,
} from '../src/state.mjs';

test('user app starts on login with no admin, weight, flow-rate, history, or YOLO section', () => {
  const state = createInitialState();
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.role, 'user');
  assert.equal(state.flockCount, 12);
  assert.equal(state.lightMode, 'red-and-warm-white');
  assert.equal('weight' in state.telemetry, false);
  assert.equal('waterFlowLpm' in state.telemetry, false);
  assert.equal(normalizePage('history'), 'home');
  assert.equal(normalizePage('admin'), 'home');
  assert.equal(normalizePage('notifications'), 'notifications');
  assert.equal(normalizePage('profile'), 'profile');
  assert.equal(normalizePage('signup'), 'signup');
});

test('dashboard model uses the existing sensor fixtures and current device states', () => {
  const initial = createInitialState();
  const model = getHomeDashboardModel(initial);
  assert.deepEqual(model, {
    displayName: 'Pengguna',
    connectionLabel: 'IoT belum terhubung',
    flockCount: 12,
    temperatureC: 28.4,
    humidityPercent: 67,
    feedLabel: 'Tersedia',
    valveLabel: 'Tertutup',
    lightingLabel: 'Mati',
    musicLabel: 'Mati',
    musicVolume: 45,
    unreadNotifications: 2,
    notifications: initial.notifications.slice(0, 2),
  });
  assert.equal('weight' in model, false);
  assert.equal('waterFlowLpm' in model, false);

  const active = toggleControl(toggleControl(toggleControl(initial, 'waterValve'), 'lighting'), 'music');
  const activeModel = getHomeDashboardModel(active);
  assert.equal(activeModel.valveLabel, 'Terbuka');
  assert.equal(activeModel.lightingLabel, 'Menyala');
  assert.equal(activeModel.musicLabel, 'Menyala');
});

test('user session state records the email but never stores a password', () => {
  const state = createInitialState();
  const loggedIn = loginUser(state, 'keeper@example.com');
  assert.equal(loggedIn.isAuthenticated, true);
  assert.equal(loggedIn.role, 'user');
  assert.equal(loggedIn.profile.email, 'keeper@example.com');
  assert.equal('password' in loggedIn, false);
  assert.equal('password' in loggedIn.profile, false);
  assert.throws(() => loginUser(state, 'not-an-email'), /valid email/i);
});

test('logout returns the app to the user login route', () => {
  const state = loginUser(createInitialState(), 'keeper@example.com');
  const loggedOut = logoutUser(state);
  assert.equal(loggedOut.isAuthenticated, false);
  assert.equal(loggedOut.profile.email, '');
});

test('user controls toggle only valve, fixed-color lamp, and music states', () => {
  const initial = createInitialState();
  const valve = toggleControl(initial, 'waterValve');
  assert.equal(valve.controls.waterValve, true);
  assert.equal(valve.telemetry.waterValveOpen, true);
  assert.equal(valve.controls.lighting, false);
  const lamp = toggleControl(valve, 'lighting');
  assert.equal(lamp.controls.lighting, true);
  assert.equal(lamp.lightMode, 'red-and-warm-white');
  assert.equal('lightColor' in lamp, false);
  const music = toggleControl(lamp, 'music');
  assert.equal(music.controls.music, true);
  assert.throws(() => toggleControl(music, 'lightColor'), /Unknown control/);
});

test('music volume accepts manual values from 0 to 100', () => {
  const initial = createInitialState();
  assert.equal(setMusicVolume(initial, 0).musicVolume, 0);
  assert.equal(setMusicVolume(initial, 72).musicVolume, 72);
  assert.equal(setMusicVolume(initial, 100).musicVolume, 100);
  assert.throws(() => setMusicVolume(initial, -1), /between 0 and 100/i);
  assert.throws(() => setMusicVolume(initial, 101), /between 0 and 100/i);
  assert.throws(() => setMusicVolume(initial, 'loud'), /number/i);
});

test('profile edits update only the user profile fields', () => {
  const initial = loginUser(createInitialState(), 'keeper@example.com');
  const updated = updateProfile(initial, { name: 'Rina', email: 'rina@example.com', phone: '081234567890' });
  assert.deepEqual(updated.profile, { name: 'Rina', email: 'rina@example.com', phone: '081234567890' });
  assert.equal(updated.isAuthenticated, true);
  assert.throws(() => updateProfile(initial, { name: '', email: 'bad', phone: '' }), /name/i);
});

test('notifications can be marked individually and together', () => {
  const initial = createInitialState();
  assert.ok(unreadCount(initial) > 0);
  const notificationId = initial.notifications.find((item) => !item.read).id;
  const marked = markNotificationRead(initial, notificationId);
  assert.equal(marked.notifications.find((item) => item.id === notificationId).read, true);
  assert.equal(unreadCount(markAllNotificationsRead(marked)), 0);
  assert.throws(() => markNotificationRead(initial, 'missing'), /notification/i);
});
