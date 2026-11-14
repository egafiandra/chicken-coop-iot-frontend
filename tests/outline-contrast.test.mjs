import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

function token(block, name) {
  const value = block.match(new RegExp(`--${name}:\\s*(#[\\da-fA-F]{6})`))?.[1];
  assert.ok(value, `missing --${name} token`);
  return value;
}

function contrastRatio(a, b) {
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = channels.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test('card outlines and inactive mobile nav remain clearly visible in both themes', async () => {
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  const mobile = await readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8');
  const lightRoot = styles.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const darkRoot = styles.match(/:root\[data-color-mode="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const lightLine = token(lightRoot, 'line');
  const darkLine = token(darkRoot, 'line');
  const lightNav = token(lightRoot, 'bottom-nav-fg');
  const lightNavSurface = token(lightRoot, 'bottom-nav-solid');
  const darkNav = token(darkRoot, 'bottom-nav-fg');
  const darkNavSurface = token(darkRoot, 'bottom-nav-solid');

  assert.ok(contrastRatio(lightLine, '#ffffff') >= 3, 'light card outline must meet non-text contrast');
  assert.ok(contrastRatio(darkLine, '#141e18') >= 3, 'dark card outline must meet non-text contrast');
  assert.ok(contrastRatio(lightNav, lightNavSurface) >= 4.5, 'light inactive nav labels must be readable');
  assert.ok(contrastRatio(darkNav, darkNavSurface) >= 4.5, 'dark inactive nav labels must be readable');
  assert.match(styles, /\.surface-card\s*\{[^}]*border:\s*2px solid var\(--line\)/s);
  assert.match(mobile, /\.coop-hero\s*\{[^}]*border:\s*2px solid var\(--user-line\)/s);
  assert.match(mobile, /\.environment-masthead\s*\{[^}]*border:\s*2px solid var\(--user-line\)/s);
  assert.match(mobile, /\.quick-menu-tile\s*\{[^}]*border:\s*2px solid var\(--user-line\)/s);
  assert.match(mobile, /\.bottom-nav \.nav-link\s*\{[^}]*color:\s*var\(--bottom-nav-fg\)/s);
  assert.match(styles, /\.icon\s*\{[^}]*stroke-width:\s*2(?:\.0)?\b/s);
});
