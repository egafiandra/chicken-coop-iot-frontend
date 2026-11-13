import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acknowledgeAlert,
  addUser,
  allActuatorsOff,
  closeModal,
  countActiveActuators,
  createAdminState,
  enterAsAdmin,
  exitSession,
  filterUsers,
  getTimeTheme,
  markAllNotificationsRead,
  markNotificationRead,
  normalizeAdminPage,
  openModal,
  resetAdminDemo,
  resolveTheme,
  setCoopFilter,
  setMusicVolume,
  setRuleValue,
  setThemePreference,
  setUserRoleFilter,
  setUserSearch,
  summarize,
  toggleActuator,
  toggleCamera,
  toggleDeviceState,
  toggleRule,
  toggleUserActive,
  unreadNotificationCount,
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

test('aktuator mulai mati dan bisa dinyalakan satu per satu', () => {
  const base = createAdminState();
  assert.equal(countActiveActuators(base), 0);
  assert.equal(base.actuators.waterValve.on, false);
  assert.equal(base.actuators.lighting.on, false);
  assert.equal(base.actuators.music.on, false);

  const water = toggleActuator(base, 'waterValve');
  assert.equal(water.actuators.waterValve.on, true);
  assert.equal(water.actuators.waterValve.flowLpm, 0.7);
  assert.equal(countActiveActuators(water), 1);
  assert.equal(water.auditLog[0].action, 'Menyalakan aktuator');

  const light = toggleActuator(water, 'lighting');
  assert.equal(light.actuators.lighting.on, true);
  assert.equal(countActiveActuators(light), 2);

  const music = toggleActuator(light, 'music');
  assert.equal(music.actuators.music.on, true);
  assert.equal(countActiveActuators(music), 3);
});

test('mematikan aktuator mengembalikan debit air ke nol', () => {
  const on = toggleActuator(createAdminState(), 'waterValve');
  const off = toggleActuator(on, 'waterValve');
  assert.equal(off.actuators.waterValve.on, false);
  assert.equal(off.actuators.waterValve.flowLpm, 0);
  assert.equal(off.auditLog[0].action, 'Mematikan aktuator');
});

test('toggle aktuator tidak mengubah state masukan (immutable)', () => {
  const base = createAdminState();
  toggleActuator(base, 'lighting');
  assert.equal(base.actuators.lighting.on, false, 'state awal tidak boleh berubah');
});

test('aktuator tak dikenal ditolak', () => {
  assert.throws(() => toggleActuator(createAdminState(), 'pintu'), /Aktuator tidak dikenal/);
  assert.throws(() => toggleActuator(createAdminState(), 'kamera'), /Aktuator tidak dikenal/);
});

test('lampu memakai mode tetap seperti panel pengguna (tidak bisa pilih warna)', () => {
  const base = createAdminState();
  assert.equal(base.actuators.lighting.mode, 'red-and-warm-white');
  // tidak ada lagi field warna yang bisa diubah dari admin
  assert.equal('color' in base.actuators.lighting, false);
});

test('volume musik memvalidasi angka bulat 0-100', () => {
  const base = createAdminState();
  assert.equal(base.actuators.music.volume, 45);
  assert.equal(setMusicVolume(base, 70).actuators.music.volume, 70);
  assert.equal(setMusicVolume(base, '30').actuators.music.volume, 30);
  assert.equal(setMusicVolume(base, 0).actuators.music.volume, 0);
  assert.equal(setMusicVolume(base, 100).actuators.music.volume, 100);
  assert.throws(() => setMusicVolume(base, 101), /antara 0 dan 100/);
  assert.throws(() => setMusicVolume(base, -1), /antara 0 dan 100/);
  assert.throws(() => setMusicVolume(base, 45.5), /angka bulat/);
  assert.throws(() => setMusicVolume(base, 'abc'), /angka bulat/);
});

test('notifikasi admin mencerminkan data pengguna dan bisa ditandai', () => {
  const base = createAdminState();
  assert.equal(base.notifications.length, 3);
  assert.equal(unreadNotificationCount(base), 2);

  const one = markNotificationRead(base, 'notice-1');
  assert.equal(unreadNotificationCount(one), 1);
  assert.equal(one.notifications.find((n) => n.id === 'notice-1').read, true);

  const all = markAllNotificationsRead(base);
  assert.equal(unreadNotificationCount(all), 0);
  assert.equal(all.notifications.every((n) => n.read), true);

  assert.throws(() => markNotificationRead(base, 'tidak-ada'), /Notifikasi tidak dikenal/);
});

test('tema otomatis mengikuti siklus siang/sore/malam seperti pengguna', () => {
  const siang = getTimeTheme(new Date(2026, 0, 1, 10, 0), 'auto');
  assert.equal(siang.period, 'siang');
  assert.equal(siang.colorMode, 'light');

  const sore = getTimeTheme(new Date(2026, 0, 1, 18, 0), 'auto');
  assert.equal(sore.period, 'sore');
  assert.equal(sore.colorMode, 'light');

  const malam = getTimeTheme(new Date(2026, 0, 1, 22, 0), 'auto');
  assert.equal(malam.period, 'malam');
  assert.equal(malam.colorMode, 'dark');
});

test('preferensi tema otomatis/manual menentukan tema efektif', () => {
  const base = createAdminState();
  assert.equal(base.themePreference, 'manual');
  assert.equal(resolveTheme(base), 'aurora', 'manual harus pakai tema tersimpan');

  const auto = setThemePreference(base, 'auto');
  assert.equal(resolveTheme(auto, new Date(2026, 0, 1, 22, 0)), 'night');
  assert.equal(resolveTheme(auto, new Date(2026, 0, 1, 10, 0)), 'aurora');

  assert.throws(() => setThemePreference(base, 'kadang'), /Preferensi tema tidak dikenal/);
});

test('matikan semua aktuator mematikan ketiganya sekaligus', () => {
  let state = createAdminState();
  state = toggleActuator(state, 'waterValve');
  state = toggleActuator(state, 'lighting');
  state = toggleActuator(state, 'music');
  assert.equal(countActiveActuators(state), 3);

  const off = allActuatorsOff(state);
  assert.equal(countActiveActuators(off), 0);
  assert.equal(off.actuators.waterValve.flowLpm, 0);
  assert.equal(off.auditLog[0].action, 'Mematikan semua aktuator');
});

test('setiap kontrol aktuator tercatat di audit log dan ditandai simulasi', () => {
  const base = createAdminState();
  const after = toggleActuator(base, 'music');
  assert.equal(after.auditLog[0].simulated, true);
  assert.equal(after.auditLog[0].actor, base.currentUser.name);
  assert.ok(after.auditLog.length > base.auditLog.length);
});

test('reset mengembalikan aktuator ke keadaan mati', () => {
  const on = toggleActuator(createAdminState(), 'lighting');
  const reset = resetAdminDemo(on);
  assert.equal(reset.actuators.lighting.on, false);
  assert.equal(countActiveActuators(reset), 0);
});

test('setiap halaman di NAV dikenali normalizeAdminPage', () => {
  // regresi: halaman baru harus didaftarkan di ADMIN_PAGES,
  // kalau tidak normalizeAdminPage diam-diam mengembalikan ke dashboard
  const pages = ['dashboard', 'users', 'coops', 'control', 'rules', 'cameras', 'logs', 'settings'];
  for (const page of pages) {
    assert.equal(normalizeAdminPage(page), page, `halaman '${page}' tidak dikenali`);
  }
});
