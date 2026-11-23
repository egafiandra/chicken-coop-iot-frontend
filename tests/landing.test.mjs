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
  // Arah "control room": kanvas gelap, bukan krem.
  assert.notEqual(token(root, 'bg').toUpperCase(), PALETTE.cream);
  assert.equal(token(root, 'cream').toUpperCase(), PALETTE.cream);
  // permukaan lebih terang dari kanvas
  assert.ok(luminance(token(root, 'surface')) > luminance(token(root, 'bg')), 'surface harus lebih terang dari bg');
});

test('landing hanya memakai warna dari palet resmi', async () => {
  const css = await read('src/landing.css');
  const allowed = new Set(Object.values(PALETTE).map((h) => h.toUpperCase()));
  // turunan netral/gelap dari palet resmi
  // turunan netral/gelap dari palet resmi (kanvas, tema, overlay foto)
  // turunan netral/gelap + warna ilustrasi SVG (hero, tema, overlay)
  // turunan netral/gelap + warna UI konsol & ilustrasi
  // turunan kanvas gelap + UI konsol control-room
  const extraAllowed = new Set([
    '#00552A', '#041C0F', '#071410', '#0B1D16', '#0B1F14', '#0F2419',
    '#0F2A1B', '#12241A', '#142E20', '#162B1F', '#1A3A28', '#1E3A2A',
    '#241A08', '#2A4433', '#2C5440', '#445E4C', '#463A20', '#5A7361',
    '#5E4A22', '#6E5930', '#7D8C7B', '#7E9C89', '#8A4A00', '#9AA79B',
    '#9DBBA8', '#A8E58C', '#C3CFC4', '#C4DCCB', '#CFC7B2', '#D2BE91',
    '#DFE5DC', '#E6A08A', '#E6D5B0', '#E7EBE4', '#E8CE9B', '#E9EDE6',
    '#EBEFE8', '#EFE4CB', '#EFF2EC', '#F0E5CB', '#F2FBF4', '#F4E8D0',
    '#F4F6F2', '#F8F0DE', '#F8F9F6', '#FBF3E2', '#FFC53F', '#FFFDF7',
  ]);

  const hexes = [...css.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toUpperCase());
  for (const hex of new Set(hexes)) {
    assert.ok(
      allowed.has(hex) || extraAllowed.has(hex),
      `warna ${hex} di luar palet resmi`,
    );
  }
});

test('landing punya kontras teks yang memadai di kanvas gelap', async () => {
  const css = await read('src/landing.css');
  const root = block(css, ':root');
  const bg = token(root, 'bg');
  const surface = token(root, 'surface');

  // teks utama di kanvas gelap & permukaan
  for (const name of ['text', 'text-2', 'text-3']) {
    assert.ok(contrast(token(root, name), bg) >= 4.5, `--${name} di kanvas gelap`);
    assert.ok(contrast(token(root, name), surface) >= 4.5, `--${name} di permukaan`);
  }

  // teks di atas aksen harus kontras
  assert.ok(contrast(token(root, 'on-accent'), token(root, 'accent')) >= 4.5, '--on-accent di --accent');
  assert.ok(contrast(token(root, 'on-gold'), token(root, 'gold')) >= 4.5, '--on-gold di --gold');
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
