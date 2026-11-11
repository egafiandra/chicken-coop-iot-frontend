import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acknowledgeAlert,
  addUser,
  closeModal,
  createAdminState,
  enterAsAdmin,
  exitSession,
  filterUsers,
  normalizeAdminPage,
  openModal,
  resetAdminDemo,
  setCoopFilter,
  setRuleValue,
  setUserRoleFilter,
  setUserSearch,
  summarize,
  toggleCamera,
  toggleDeviceState,
  toggleRule,
  toggleUserActive,
  updateUser,
} from '../src/admin/state.mjs';

test('admin state seeds kandang, perangkat, pengguna, dan alert yang ditandai simulasi', () => {
  const state = createAdminState();
  assert.equal(state.mode, 'simulation');
  assert.equal(state.session, null);
  assert.equal(state.currentUser.role, 'admin');
  assert.ok(state.coops.length >= 3);
  assert.ok(state.devices.length >= 5);
  assert.ok(state.users.length >= 4);
  assert.ok(state.alerts.length >= 3);
  assert.equal(state.users.every((user) => user.simulated), true);
  assert.equal(state.devices.every((device) => device.simulated), true);
  assert.equal(state.auditLog.every((entry) => entry.simulated), true);
});

test('gerbang peran bisa masuk sebagai admin lalu keluar lagi', () => {
  const state = createAdminState();
  const entered = enterAsAdmin(state);
  assert.equal(entered.session, 'admin');
  assert.equal(exitSession(entered).session, null);
  assert.equal(state.session, null, 'state awal tidak boleh berubah');
});

test('rute admin menolak halaman tak dikenal dan kembali ke dashboard', () => {
  assert.equal(normalizeAdminPage('users'), 'users');
  assert.equal(normalizeAdminPage('rules'), 'rules');
  assert.equal(normalizeAdminPage('index.html'), 'dashboard');
  assert.equal(normalizeAdminPage(''), 'dashboard');
});

test('pencarian dan filter peran menyaring daftar pengguna', () => {
  let state = createAdminState();
  assert.equal(filterUsers(state).length, state.users.length);

  state = setUserSearch(state, 'rani');
  assert.equal(filterUsers(state).length, 1);
  assert.equal(filterUsers(state)[0].name, 'Rani Kusuma');

  state = setUserSearch(createAdminState(), '');
  state = setUserRoleFilter(state, 'admin');
  assert.equal(filterUsers(state).every((user) => user.role === 'admin'), true);

  assert.throws(() => setUserRoleFilter(state, 'owner'), /Unknown role filter/);
});

test('tambah pengguna memvalidasi nama, email, duplikat, dan peran', () => {
  const state = createAdminState();
  const valid = addUser(state, { name: 'Tono Wijaya', email: 'tono@kandang.id', role: 'pengguna', coopId: 'coop-1' });
  assert.equal(valid.users.length, state.users.length + 1);
  assert.equal(valid.users.at(-1).active, true);
  assert.equal(valid.auditLog[0].action, 'Menambah pengguna');
  assert.equal(valid.auditLog[0].simulated, true);
  assert.equal(valid.ui.modal, null);

  assert.throws(() => addUser(state, { name: 'A', email: 'a@b.co', role: 'pengguna' }), /minimal 2 karakter/);
  assert.throws(() => addUser(state, { name: 'Valid', email: 'bukan-email', role: 'pengguna' }), /Format email/);
  assert.throws(() => addUser(state, { name: 'Valid', email: 'rani@kandang.id', role: 'pengguna' }), /sudah dipakai/);
  assert.throws(() => addUser(state, { name: 'Valid', email: 'x@y.co', role: 'owner' }), /Role tidak dikenal/);
});

test('ubah pengguna memperbarui data dan menolak email milik akun lain', () => {
  const state = createAdminState();
  const updated = updateUser(state, 'u-2', { name: 'Rani Kusuma Dewi', email: 'rani.dewi@kandang.id', role: 'pengguna', coopId: 'coop-2' });
  const user = updated.users.find((item) => item.id === 'u-2');
  assert.equal(user.name, 'Rani Kusuma Dewi');
  assert.equal(user.coopId, 'coop-2');
  assert.equal(updated.auditLog[0].action, 'Mengubah pengguna');

  assert.throws(() => updateUser(state, 'u-2', { name: 'Rani', email: 'bagas@kandang.id', role: 'pengguna' }), /sudah dipakai/);
  assert.throws(() => updateUser(state, 'tidak-ada', { name: 'X Y', email: 'x@y.co', role: 'admin' }), /tidak ditemukan/);
});

test('admin tidak bisa menonaktifkan akunnya sendiri', () => {
  const state = createAdminState();
  assert.throws(() => toggleUserActive(state, state.currentUser.id), /sedang dipakai/);
  const next = toggleUserActive(state, 'u-4');
  assert.equal(next.users.find((user) => user.id === 'u-4').active, true);
  assert.equal(next.auditLog[0].action, 'Mengaktifkan pengguna');
});

test('aturan otomasi memvalidasi angka, urutan batas, dan warna lampu', () => {
  const state = createAdminState();
  assert.equal(setRuleValue(state, 'temperature', 'max', 34).rules.temperature.max, 34);
  assert.equal(typeof setRuleValue(state, 'temperature', 'min', '26').rules.temperature.min, 'number');
  assert.equal(setRuleValue(state, 'lighting', 'color', 'red').rules.lighting.color, 'red');
  assert.equal(setRuleValue(state, 'feed', 'notifyWhenEmpty', false).rules.feed.notifyWhenEmpty, false);

  assert.throws(() => setRuleValue(state, 'temperature', 'max', 'panas'), /harus berupa angka/);
  assert.throws(() => setRuleValue(state, 'temperature', 'max', -1), /tidak boleh negatif/);
  assert.throws(() => setRuleValue(state, 'temperature', 'min', 40), /minimum harus lebih kecil/);
  assert.throws(() => setRuleValue(state, 'lighting', 'color', 'biru'), /tidak didukung/);
  assert.throws(() => setRuleValue(state, 'tidakAda', 'min', 1), /Aturan tidak dikenal/);
  assert.throws(() => setRuleValue(state, 'temperature', 'tidakAda', 1), /Kolom aturan tidak dikenal/);
});

test('toggle aturan mengubah status aktif dan tercatat di log', () => {
  const state = createAdminState();
  const next = toggleRule(state, 'music');
  assert.equal(next.rules.music.enabled, true);
  assert.equal(next.auditLog[0].action, 'Mengaktifkan aturan');
  assert.equal(toggleRule(next, 'music').rules.music.enabled, false);
  assert.throws(() => toggleRule(state, 'tidakAda'), /Aturan tidak dikenal/);
});

test('alert, perangkat, dan kamera bisa ditindaklanjuti admin', () => {
  const state = createAdminState();
  const acked = acknowledgeAlert(state, 'al-1');
  assert.equal(acked.alerts.find((alert) => alert.id === 'al-1').acknowledged, true);
  assert.equal(summarize(acked).openAlerts, summarize(state).openAlerts - 1);

  const device = toggleDeviceState(state, 'dev-4');
  assert.equal(device.devices.find((item) => item.id === 'dev-4').status, 'online');

  const camera = toggleCamera(state, 'cam-2');
  assert.equal(camera.cameras.find((item) => item.id === 'cam-2').active, true);

  assert.throws(() => acknowledgeAlert(state, 'x'), /Alert tidak dikenal/);
  assert.throws(() => toggleDeviceState(state, 'x'), /Perangkat tidak dikenal/);
  assert.throws(() => toggleCamera(state, 'x'), /Kamera tidak dikenal/);
});

test('filter kandang dan modal dikelola lewat state', () => {
  const state = createAdminState();
  assert.equal(setCoopFilter(state, 'coop-1').ui.coopFilter, 'coop-1');
  assert.throws(() => setCoopFilter(state, 'coop-x'), /Kandang tidak dikenal/);

  const opened = openModal(state, { type: 'user', mode: 'add', userId: null });
  assert.equal(opened.ui.modal.mode, 'add');
  assert.equal(closeModal(opened).ui.modal, null);
});

test('ringkasan menghitung kandang, pengguna, perangkat, dan alert', () => {
  const stats = summarize(createAdminState());
  assert.equal(stats.totalCoops, 3);
  assert.equal(stats.activeCoops, 2);
  assert.equal(stats.totalDevices, 6);
  assert.equal(stats.online + stats.warning + stats.offline, stats.totalDevices);
  assert.equal(stats.totalUsers, 4);
  assert.equal(stats.openAlerts, 3);
  assert.equal(stats.flockTotal, 36);
});

test('reset mengembalikan fixture admin tetapi mempertahankan sesi', () => {
  const changed = toggleUserActive(enterAsAdmin(createAdminState()), 'u-2');
  const reset = resetAdminDemo(changed);
  assert.equal(reset.session, 'admin');
  assert.equal(reset.users.find((user) => user.id === 'u-2').active, true);
  assert.equal(reset.auditLog.length, createAdminState().auditLog.length);
});
