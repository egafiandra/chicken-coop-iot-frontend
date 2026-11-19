import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEditionSettings, renderProPanel } from '../src/user-edition-view.mjs';

test('edition settings expose Lite and Pro with a selected state', () => {
  const html = renderEditionSettings('pro');
  assert.match(html, /Pilih versi aplikasi/);
  assert.match(html, /data-action="select-edition" data-edition="lite"/);
  assert.match(html, /data-action="select-edition" data-edition="pro"/);
  assert.match(html, /aria-pressed="false"[^>]*>Lite/);
  assert.match(html, /aria-pressed="true"[^>]*>Pro/);
});

test('Pro panel embeds the existing admin page with an accessible title', () => {
  const html = renderProPanel();
  assert.match(html, /<iframe/);
  assert.match(html, /src="\.\/admin\.html"/);
  assert.match(html, /title="Panel admin Smart Poultry Pro"/);
});
