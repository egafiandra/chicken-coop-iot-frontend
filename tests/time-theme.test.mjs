import test from 'node:test';
import assert from 'node:assert/strict';

test('local clock resolves automatic day, evening, and night themes', async () => {
  const module = await import('../src/time-theme.mjs').catch(() => null);
  assert.equal(typeof module?.getTimeTheme, 'function', 'time theme utility must be available');

  const at = (hour, minute = 0) => new Date(2026, 10, 12, hour, minute);
  assert.deepEqual(module.getTimeTheme(at(5, 59)), {
    period: 'malam', periodLabel: 'Malam', clock: '05:59', colorMode: 'dark',
  });
  assert.deepEqual(module.getTimeTheme(at(6)), {
    period: 'siang', periodLabel: 'Siang', clock: '06:00', colorMode: 'light',
  });
  assert.deepEqual(module.getTimeTheme(at(12, 5)), {
    period: 'siang', periodLabel: 'Siang', clock: '12:05', colorMode: 'light',
  });
  assert.deepEqual(module.getTimeTheme(at(17, 30)), {
    period: 'sore', periodLabel: 'Sore', clock: '17:30', colorMode: 'light',
  });
  assert.deepEqual(module.getTimeTheme(at(19, 59)), {
    period: 'sore', periodLabel: 'Sore', clock: '19:59', colorMode: 'light',
  });
  assert.deepEqual(module.getTimeTheme(at(20)), {
    period: 'malam', periodLabel: 'Malam', clock: '20:00', colorMode: 'dark',
  });
  assert.equal(module.getTimeTheme(at(12), 'dark').colorMode, 'dark');
  assert.equal(module.getTimeTheme(at(22), 'light').colorMode, 'light');
  assert.equal(module.normalizeThemePreference('unknown'), 'auto');
});
