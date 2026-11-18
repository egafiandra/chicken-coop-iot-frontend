import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const mobileStyles = await readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8');

test('mobile time readout keeps the day period visible on narrow screens', () => {
  const narrowCss = mobileStyles.split('@media (max-width: 360px)')[1]?.split('@media')[0] ?? '';
  assert.ok(narrowCss, 'narrow mobile breakpoint must exist');
  assert.doesNotMatch(narrowCss, /\.time-period-label[^}]*display:\s*none/i);
});

test('mobile header shows the current light or dark mode label', () => {
  assert.match(mobileStyles, /\.time-mode-label\s*\{\s*display:\s*inline\s*;/i);
  assert.match(mobileStyles, /\.theme-mode-label-short\s*\{\s*display:\s*inline\s*;/i);
});
