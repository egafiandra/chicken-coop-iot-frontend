import test from 'node:test';
import assert from 'node:assert/strict';
import { renderUserProDashboard } from '../src/user-pro-dashboard.mjs';

const model = {
  displayName: 'Pengguna Demo',
  connectionLabel: 'IoT belum terhubung',
  flockCount: 12,
  temperatureC: 28.4,
  humidityPercent: 67,
  feedLabel: 'Tersedia',
  valveLabel: 'Tertutup',
  lightingLabel: 'Menyala',
  musicLabel: 'Mati',
  musicVolume: 45,
  unreadNotifications: 2,
  notifications: [
    { id: 'notice-1', title: 'Tempat pakan', message: 'Pakan tersedia.', time: '08:13', read: false },
    { id: 'notice-2', title: 'Kondisi kandang', message: 'Suhu 28.4 °C, kelembapan 67%.', time: '08:20', read: false },
  ],
};

const helpers = {
  escapeHTML: (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]),
  icon: (name) => `<svg data-icon="${name}"></svg>`,
  sectionHeading: (title, detail) => `<header><h2>${title}</h2><p>${detail}</p></header>`,
  statePill: (label, tone = 'neutral') => `<span class="state-pill tone-${tone}">${label}</span>`,
};

test('Pro dashboard presents only existing user metrics and device state', () => {
  const html = renderUserProDashboard(model, helpers);
  assert.match(html, /Dashboard kandang/);
  assert.match(html, /class="hero user-pro-hero/);
  assert.match(html, /class="kpi-grid user-pro-metric-grid"/);
  assert.match(html, /class="duo-eq user-pro-panels"/);
  assert.match(html, /class="card user-pro-devices"/);
  assert.match(html, /12/);
  assert.match(html, /28\.4/);
  assert.match(html, /67%/);
  assert.match(html, /IoT belum terhubung/);
  assert.match(html, /Tersedia/);
  assert.match(html, /Tertutup/);
  assert.match(html, /Menyala/);
  assert.match(html, /Volume 45%/);
  assert.match(html, /2 belum dibaca/);
  assert.doesNotMatch(html, /Pengguna aktif|4\/6|Kandang terdaftar|admin\.html|Aturan & otomasi/i);
});

test('Pro dashboard links to the user notifications route', () => {
  const html = renderUserProDashboard(model, helpers);
  assert.match(html, /href="#\/notifications" data-page="notifications"/);
});
