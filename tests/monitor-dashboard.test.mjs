import test from 'node:test';
import assert from 'node:assert/strict';

const model = {
  temperatureC: 28.4,
  humidityPercent: 67,
  feedLabel: 'Tersedia',
  valveLabel: 'Tertutup',
  lightingLabel: 'Menyala',
  musicLabel: 'Mati',
  musicVolume: 45,
  temperatureSeries: [27.6, 27.9, 28.1, 28.0, 28.3, 28.4],
  humiditySeries: [71, 70, 69, 68, 67, 67],
  chartLabels: ['08:00', '08:06', '08:12', '08:18', '08:24', '08:30'],
};

const helpers = {
  escapeHTML: (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]),
  icon: (name) => `<svg data-icon="${name}"></svg>`,
  sectionHeading: (title, detail, action = '') => `<header><h2>${title}</h2><p>${detail}</p>${action}</header>`,
  statePill: (label, tone) => `<span class="pill ${tone}">${label}</span>`,
  trendChart: (title, values, labels, unit) => `<article class="trend-card" data-title="${title}"><h3>${title}</h3><p>${values.length} points, ${labels[0]}-${labels.at(-1)} ${unit}</p></article>`,
};

test('monitor dashboard groups existing readings and omits out-of-scope telemetry', async () => {
  const module = await import('../src/monitor-dashboard.mjs').catch(() => null);
  assert.equal(typeof module?.renderMonitorDashboard, 'function', 'monitor dashboard renderer must be available');

  const html = module.renderMonitorDashboard(model, helpers);
  assert.match(html, /class="environment-masthead monitor-environment"/);
  assert.match(html, /28\.4/);
  assert.match(html, /67%/);
  assert.match(html, /Tersedia/);
  assert.match(html, /Tertutup/);
  assert.match(html, /data-title="Suhu udara"/);
  assert.match(html, /data-title="Kelembapan udara"/);
  assert.match(html, /Lampu kandang/);
  assert.match(html, /Musik klasik/);
  assert.doesNotMatch(html, /Berat|Debit|YOLO|Riwayat|history/i);
  assert.doesNotMatch(html, /class="monitor-grid"/);
});
