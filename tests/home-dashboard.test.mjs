import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHomeDashboard } from '../src/home-dashboard.mjs';

const model = {
  displayName: '<script>bad()</script>',
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
  notifications: [
    { id: 'notice-1', title: 'Tempat pakan', message: 'Pakan tersedia.', time: '08:13', read: false, kind: 'feed' },
    { id: 'notice-2', title: 'Kondisi kandang', message: 'Suhu normal.', time: '08:20', read: false, kind: 'sensor' },
  ],
};

const helpers = {
  icon: (name) => `<svg data-icon="${name}"></svg>`,
  sectionHeading: (title, detail, action = '') => `<header><h2>${title}</h2><p>${detail}</p>${action}</header>`,
  statePill: (label, tone) => `<span class="pill ${tone}">${label}</span>`,
  escapeHTML: (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]),
};

test('home dashboard renders the coop scene and only existing monitoring data', () => {
  const html = renderHomeDashboard(model, helpers);
  assert.match(html, /src="\.\/src\/assets\/commons\/red-hens-coop\.jpg"/);
  assert.match(html, /alt="Ayam Rhode Island Red berkumpul di dalam kandang"/);
  assert.doesNotMatch(html, /src="\.\/src\/coop-scene\.svg"/);
  assert.match(html, /class="environment-masthead"/);
  assert.match(html, /class="quick-menu-grid"/);
  assert.match(html, /class="coop-hero-actions"/);
  assert.match(html, /Jumlah ayam/);
  assert.match(html, /12/);
  assert.match(html, /28\.4/);
  assert.match(html, /67/);
  assert.match(html, /Tersedia/);
  assert.match(html, /Tertutup/);
  assert.match(html, /Kamera belum terhubung/);
  assert.match(html, /IoT belum terhubung/);
  assert.doesNotMatch(html, /home-device-card|notification-preview|Notifikasi terbaru|Status lampu dan musik/);
  assert.doesNotMatch(html, /class="home-metric-grid"/);
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  assert.doesNotMatch(html, /Berat|Debit|YOLO|Riwayat/i);
});

test('home dashboard keeps quick routes and a safe profile greeting', () => {
  const html = renderHomeDashboard(model, helpers);
  assert.match(html, /class="quick-menu-tile" href="#\/monitor" data-page="monitor"/);
  assert.match(html, /class="quick-menu-tile" href="#\/controls" data-page="controls"/);
  assert.match(html, /class="quick-menu-tile(?: quick-menu-camera)?" href="#\/camera" data-page="camera"/);
  assert.match(html, /class="quick-menu-tile" href="#\/notifications" data-page="notifications"/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(html, /2 belum dibaca/);
});

test('home hero photograph is bundled with a local usage credit', async () => {
  const image = await readFile(new URL('../src/assets/commons/red-hens-coop.jpg', import.meta.url)).catch(() => null);
  assert.ok(image, 'the home hero photo must be bundled locally');
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(image.length > 100_000);
  const credit = await readFile(new URL('../src/assets/commons/ASSET_CREDITS.md', import.meta.url), 'utf8').catch(() => '');
  assert.match(credit, /CC0/i);
  assert.match(credit, /SteveStrummer/i);
});

test('coop illustration is a self-contained accessible SVG', async () => {
  const svg = await readFile(new URL('../src/coop-scene.svg', import.meta.url), 'utf8');
  assert.match(svg, /<svg[^>]+viewBox="0 0 720 320"/);
  assert.match(svg, /<title[^>]*>.*kandang ayam.*<\/title>/i);
  assert.match(svg, /<desc[^>]*>.*lahan hijau.*<\/desc>/i);
  assert.doesNotMatch(svg, /<image\b[^>]*(?:href|xlink:href)=["']https?:\/\//i);
});
