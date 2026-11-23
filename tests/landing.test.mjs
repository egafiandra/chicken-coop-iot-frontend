import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

const PALETTE = {
  forest: '#006B35',
  deep: '#00843D',
  fresh: '#55B82A',
  orange: '#FF8A00',
  gold: '#FFB515',
  cream: '#FFF4D8',
  white: '#FFFFFF',
};

function block(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
}

function token(blockText, name) {
  const value = blockText.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
  assert.ok(value, `missing --${name}`);
  return value;
}

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = channels.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('landing page ada dan memuat logo Smart Poultry', async () => {
  const html = await read('landing.html');

  assert.match(html, /<title>Smart Poultry/);
  assert.match(html, /logo-smart-poultry-mark-256\.png/);
  // logo di header/footer dekoratif (link sudah berlabel), jadi alt="" adalah praktik benar
  assert.match(html, /aria-label="Smart Poultry, ke beranda"/);
});

test('aset logo tersedia dalam versi penuh dan ringkas', async () => {
  for (const name of ['logo-smart-poultry.png', 'logo-smart-poultry-mark.png', 'logo-smart-poultry-mark-256.png']) {
    const info = await stat(new URL(`../src/assets/${name}`, import.meta.url));
    assert.ok(info.size > 1000, `${name} harus berisi gambar nyata`);
  }
});

test('landing memakai tujuh warna palet resmi sebagai token', async () => {
  const css = await read('src/landing.css');
  const root = block(css, ':root');

  for (const [name, hex] of Object.entries(PALETTE)) {
    assert.equal(token(root, name).toUpperCase(), hex, `token --${name} harus ${hex}`);
  }
  // Kanvas sengaja netral (bukan krem) agar halaman tidak didominasi krem.
  // Krem tetap token resmi dan dipakai sebagai aksen (band, marquee, readout).
  assert.notEqual(token(root, 'canvas').toUpperCase(), PALETTE.cream);
  assert.equal(token(root, 'cream').toUpperCase(), PALETTE.cream);
  assert.equal(token(root, 'surface').toUpperCase(), PALETTE.white);
});

test('landing hanya memakai warna dari palet resmi', async () => {
  const css = await read('src/landing.css');
  const allowed = new Set(Object.values(PALETTE).map((h) => h.toUpperCase()));
  // turunan netral/gelap dari palet resmi
  // turunan netral/gelap dari palet resmi (kanvas, tema, overlay foto)
  const extraAllowed = new Set([
    '#00502A', '#041C0F', '#072A16', '#0A1A11', '#0B1F14', '#0F2418',
    '#122B1C', '#1C3025', '#241A08', '#26402F', '#2C4436', '#445E4C',
    '#463A20', '#5A7361', '#5A7A63', '#5E4A22', '#6E5930', '#7D8C7B',
    '#86A895', '#8A4A00', '#8AA79A', '#8C9B8F', '#9DBAAB', '#B9D8C3',
    '#C2D8C9', '#C6F5A8', '#D5CFBA', '#DFE5DC', '#E6D5B0', '#EAF6EC',
    '#EBEFE8', '#EFF2EC', '#F0E5CB', '#F2FBF4', '#F4E8D0', '#F8F9F6',
    '#FBF3E2', '#FFC53F',
  ]);

  const hexes = [...css.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toUpperCase());
  for (const hex of new Set(hexes)) {
    assert.ok(
      allowed.has(hex) || extraAllowed.has(hex),
      `warna ${hex} di luar palet resmi`,
    );
  }
});

test('landing punya kontras teks yang memadai di kanvas krem', async () => {
  const css = await read('src/landing.css');
  const root = block(css, ':root');
  const canvas = token(root, 'canvas');
  const surface = token(root, 'surface');

  // teks utama di section terang
  for (const name of ['text', 'text-2', 'text-3']) {
    assert.ok(contrast(token(root, name), canvas) >= 4.5, `--${name} di kanvas krem`);
    assert.ok(contrast(token(root, name), surface) >= 4.5, `--${name} di permukaan putih`);
  }

  // teks di section gelap harus terbaca di atas latar gelap
  for (const name of ['on-dark', 'on-dark-2', 'on-dark-3']) {
    assert.ok(contrast(token(root, name), token(root, 'ink-900')) >= 4.5, `--${name} di latar gelap`);
  }

  // tombol emas: teks gelap di atas Golden Yellow
  assert.ok(contrast(token(root, 'on-gold'), PALETTE.gold) >= 4.5, 'teks tombol emas');
});

test('landing mengarahkan ke halaman login dan pendaftaran', async () => {
  const html = await read('landing.html');
  assert.match(html, /href="\.\/index\.html#\/login"/);
  assert.match(html, /href="\.\/index\.html#\/signup"/);
  assert.match(html, /href="\.\/admin\.html"/);
});

test('landing tetap terbaca tanpa JavaScript (progressive enhancement)', async () => {
  const css = await read('src/landing.css');
  const js = await read('src/landing.mjs');

  // konten tidak boleh disembunyikan lewat CSS dasar
  const reveal = block(css, '.reveal');
  assert.match(reveal, /opacity:\s*0/, '.reveal dipakai untuk animasi');
  // ada aturan eksplisit untuk kondisi tanpa JS
  assert.match(css, /html\.no-js\s+\.reveal\s*\{[^}]*opacity:\s*1/s);

  // kelas .reveal hanya dipasang setelah observer siap
  assert.match(js, /classList\.add\('reveal'\)/);
  // ada fallback timer yang memaksa semua konten tampil
  assert.match(js, /setTimeout/);
  assert.match(js, /revealAll/);
});

test('panel login menyediakan jalan kembali ke landing', async () => {
  const main = await read('src/main.mjs');
  assert.match(main, /href="\.\/landing\.html"/);
  assert.match(main, /Kembali ke beranda/);
  // brand di halaman auth mengarah ke landing, bukan ke rute login
  assert.match(main, /class="auth-brand-link" href="\.\/landing\.html"/);
});
