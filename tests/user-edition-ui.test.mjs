import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEditionSettings, renderProProfileShortcut, renderSettingsShortcut } from '../src/user-edition-view.mjs';

test('Pro profile shortcut links to Pengaturan and safely renders the user name', () => {
  const html = renderProProfileShortcut('E', 'Ega <script>alert(1)</script>');
  assert.match(html, /<a class="rail-user" href="#\/settings" data-page="settings"/);
  assert.match(html, /aria-label="Buka Pengaturan profil pengguna"/);
  assert.match(html, /Ega &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test('edition settings expose Lite and Pro with a selected state', () => {
  const html = renderEditionSettings('pro');
  assert.match(html, /Pilih versi aplikasi/);
  assert.match(html, /data-action="select-edition" data-edition="lite"/);
  assert.match(html, /data-action="select-edition" data-edition="pro"/);
  assert.match(html, /aria-pressed="false"[^>]*>Lite/);
  assert.match(html, /aria-pressed="true"[^>]*>Pro/);
});

test('Settings shortcut is a labeled gear link to user Pengaturan', () => {
  const html = renderSettingsShortcut((name) => `<svg data-icon="${name}"></svg>`);
  assert.match(html, /class="settings-shortcut"/);
  assert.match(html, /href="#\/settings" data-page="settings"/);
  assert.match(html, /aria-label="Pengaturan" title="Pengaturan"/);
  assert.match(html, /data-icon="settings"/);
  assert.match(html, />Pengaturan<\/span>/);
});
