import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAdminState, getEnvironmentModel, resolveTheme, setRuleValue } from '../src/admin/state.mjs';

// Palet admin: warna resmi -> token tempat ia hidup.
// Moss/Khaki/Ivory sengaja tidak punya token sendiri agar tidak ada
// deklarasi menganggur; nilainya dipakai lewat alias --fresh/--gold/--cream.
const PALETTE = [
  ['forest', '#315C42', 'Dark Forest'],
  ['fresh',  '#78966B', 'Moss Green'],
  ['gold',   '#C5B98B', 'Muted Khaki'],
  ['surface-3', '#E8D9B5', 'Sand Beige'],
  ['cream',  '#F8F5EB', 'Ivory'],
  ['white',  '#FFFFFF', 'White'],
];


const readAdminStyles = () => readFile(new URL('../src/admin/styles.css', import.meta.url), 'utf8');

function block(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
}

function token(blockText, name) {
  const value = blockText.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
  assert.ok(value, `missing --${name} token`);
  return value;
}

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test('panel admin memakai lima warna palet resmi sebagai token', async () => {
  const css = await readAdminStyles();
  const root = block(css, ':root');

  for (const [name, hex, label] of PALETTE) {
    assert.equal(token(root, name).toLowerCase(), hex.toLowerCase(), `token --${name} harus ${hex} (${label})`);
  }

  // kanvas ivory, permukaan putih
  assert.equal(token(root, 'canvas').toUpperCase(), '#F8F5EB');
  assert.equal(token(root, 'surface-solid').toUpperCase(), '#FFFFFF');

  // sidebar memakai Dark Forest, penanda Muted Khaki
  assert.equal(token(root, 'sidebar-bg').toUpperCase(), '#315C42');
  assert.equal(token(root, 'sidebar-active-icon').toUpperCase(), '#C5B98B');
});

test('warna palet lama tidak tersisa di panel admin', async () => {
  const css = await readAdminStyles();
  const legacy = ['#154212', '#2d5a27', '#faf9f4', '#4b7d83', '#7e5700', '#ffdead', '#fdbe50', '#39754d'];
  for (const hex of legacy) {
    assert.equal(css.toLowerCase().includes(hex), false, `warna lama ${hex} masih dipakai`);
  }
});

test('tiga tema admin (aurora, sore, night) mendefinisikan kanvas dan teks', async () => {
  const css = await readAdminStyles();
  for (const selector of [':root', '[data-theme="sore"]', '[data-theme="night"]']) {
    const tokens = block(css, selector);
    assert.ok(tokens, `blok ${selector} tidak ditemukan`);
    for (const name of ['canvas', 'surface-solid', 'ink', 'line', 'ok-dot', 'warn-dot', 'bad-dot']) {
      assert.ok(token(tokens, name), `${selector} harus punya --${name}`);
    }
  }
});

test('teks dan aksen tema terang memenuhi kontras minimum', async () => {
  const css = await readAdminStyles();
  const root = block(css, ':root');
  const canvas = token(root, 'canvas');
  const surface = token(root, 'surface-solid');

  for (const name of ['ink', 'ink-2', 'ink-3']) {
    assert.ok(contrast(token(root, name), canvas) >= 4.5, `--${name} harus terbaca di kanvas krem`);
    assert.ok(contrast(token(root, name), surface) >= 4.5, `--${name} harus terbaca di permukaan putih`);
  }
  // pill status tetap terbaca di atas kanvas krem
  for (const name of ['ok-fg', 'warn-fg', 'bad-fg']) {
    assert.ok(contrast(token(root, name), canvas) >= 4.5, `--${name} harus terbaca di kanvas`);
  }
});

test('teks tema gelap memenuhi kontras minimum di kanvas gelap', async () => {
  const css = await readAdminStyles();
  const night = block(css, '[data-theme="night"]');
  const canvas = token(night, 'canvas');
  for (const name of ['ink', 'ink-2', 'ink-3', 'muted', 'ok-fg', 'warn-fg', 'bad-fg']) {
    assert.ok(contrast(token(night, name), canvas) >= 4.5, `--${name} tema night harus terbaca`);
  }
});

test('dashboard admin punya model lingkungan yang mencerminkan sensor pengguna', () => {
  const state = createAdminState();
  const env = getEnvironmentModel(state);

  assert.equal(env.temperatureC, 28.4);
  assert.equal(env.humidityPercent, 67);
  assert.equal(env.feedLabel, 'Tersedia');
  assert.equal(env.temperatureState, 'ok');
  assert.equal(env.humidityState, 'ok');
  assert.equal(env.temperatureRange, '24–32 °C');
  assert.equal(env.humidityRange, '55–75%');
  assert.equal(env.temperatureSeries.length, env.chartLabels.length);
});

test('status lingkungan mengikuti ambang aturan yang diubah admin', () => {
  const base = createAdminState();
  const hot = setRuleValue(base, 'temperature', 'max', 28);
  assert.equal(getEnvironmentModel(hot).temperatureState, 'high');

  const cold = setRuleValue(base, 'temperature', 'min', 29);
  assert.equal(getEnvironmentModel(cold).temperatureState, 'low');

  const dry = setRuleValue(base, 'humidity', 'max', 60);
  assert.equal(getEnvironmentModel(dry).humidityState, 'high');

  const off = { ...base, rules: { ...base.rules, temperature: { ...base.rules.temperature, enabled: false } } };
  assert.equal(getEnvironmentModel(off).temperatureState, 'off');
});

test('tema otomatis admin membedakan siang, sore, dan malam seperti panel pengguna', () => {
  const auto = { ...createAdminState(), themePreference: 'auto' };
  assert.equal(resolveTheme(auto, new Date(2026, 0, 1, 10, 0)), 'aurora');
  assert.equal(resolveTheme(auto, new Date(2026, 0, 1, 18, 0)), 'sore');
  assert.equal(resolveTheme(auto, new Date(2026, 0, 1, 22, 0)), 'night');
});
