import test from 'node:test';
import assert from 'node:assert/strict';
import * as proDashboard from '../src/user-pro-dashboard.mjs';
import { renderHomeDashboard } from '../src/home-dashboard.mjs';

const model = {
  displayName: 'Pengguna demo',
  connectionLabel: 'IoT belum terhubung',
  flockCount: 12,
  temperatureC: 28.4,
  humidityPercent: 67,
  feedLabel: 'Tersedia',
  valveLabel: 'Tertutup',
  lightingLabel: 'Mati',
  musicLabel: 'Mati',
  musicVolume: 45,
  unreadNotifications: 0,
  notifications: [],
};

const helpers = {
  icon: (name) => `<svg data-icon="${name}"></svg>`,
  sectionHeading: (title, detail) => `<header><h2>${title}</h2><p>${detail}</p></header>`,
  statePill: (label, tone) => `<span class="pill ${tone}">${label}</span>`,
  escapeHTML: (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]),
};

const sceneControls = {
  controls: { lighting: true, music: false, waterValve: true },
  period: 'sore',
  periodPreference: 'sore',
  periodLabel: 'Sore',
  clock: '12:14',
  datetime: '2026-11-25T05:14:00.000Z',
  motionPreference: 'gentle',
  activityLabel: 'Ayam bergerak santai',
};

test('Lite user home returns to the original photo hero without Pro scene controls', () => {
  const html = renderHomeDashboard(model, helpers);
  assert.match(html, /class="coop-hero-photo"[^>]+red-hens-coop\.jpg/);
  assert.match(html, /class="coop-hero-copy"/);
  assert.match(html, /class="coop-flock-count"/);
  assert.doesNotMatch(html, /home-coop-3d|coop-control-suite|Kontrol IoT|Mode waktu/);
});

test('Pro dashboard contains the 3D scene and responsive controls with real demo state', () => {
  const html = proDashboard.renderUserProDashboard(model, helpers, sceneControls);
  assert.match(html, /user-pro-hero/);
  assert.match(html, /id="pro-coop-3d"/);
  assert.match(html, /Visualisasi konseptual kandang/);
  assert.match(html, /Kontrol IoT/);
  assert.match(html, /Mode waktu/);
  assert.match(html, /Status perangkat/);
  assert.match(html, /data-action="toggle-control"[^>]+data-key="lighting"[^>]+aria-pressed="true"/);
  assert.match(html, /data-action="toggle-control"[^>]+data-key="music"[^>]+aria-pressed="false"/);
  assert.match(html, /data-action="toggle-control"[^>]+data-key="waterValve"[^>]+aria-pressed="true"/);
  assert.match(html, /data-pro-status-key="lighting"/);
  assert.match(html, /data-pro-status-key="music"/);
  assert.match(html, /data-pro-status-key="waterValve"/);
  assert.match(html, /data-pro-device-key="lighting"/);
  assert.match(html, /data-pro-device-key="music"/);
  assert.match(html, /data-pro-device-key="waterValve"/);
  assert.match(html, /data-action="set-coop-period"[^>]+data-period="sore"[^>]+aria-pressed="true"/);
  assert.match(html, /data-action="toggle-coop-motion"[^>]+checked/);
  assert.match(html, /12:14/);
  assert.match(html, /Tidak terhubung ke ESP atau perangkat nyata/);
  assert.doesNotMatch(html, /(?:\d+) FPS|frame (?:\d+)/i);
});

test('Pro control state sync updates existing dashboard nodes in place', () => {
  assert.equal(typeof proDashboard.updateProCoopDashboard, 'function');
  if (typeof proDashboard.updateProCoopDashboard !== 'function') return;

  const makeNode = (dataset = {}, children = {}) => {
    const attrs = new Map();
    const classes = new Set();
    return {
      dataset,
      children,
      textContent: '',
      className: '',
      checked: false,
      dateTime: '',
      setAttribute(name, value) { attrs.set(name, String(value)); },
      getAttribute(name) { return attrs.get(name) ?? null; },
      querySelector(selector) { return children[selector] || null; },
      classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
      hasClass(name) { return classes.has(name); },
    };
  };
  const switches = ['lighting', 'music', 'waterValve'].map((key) => {
    const sr = makeNode();
    return makeNode({ key }, { '.sr-only': sr });
  });
  const statusRows = ['lighting', 'music', 'waterValve'].map((key) => {
    const dot = makeNode();
    const value = makeNode();
    return makeNode({ proStatusKey: key }, { '.coop-device-dot': dot, strong: value });
  });
  const deviceRows = ['lighting', 'music', 'waterValve'].map((key) => {
    const chip = makeNode();
    return makeNode({ proDeviceKey: key }, { '.chip': chip });
  });
  const periods = ['auto', 'siang', 'sore', 'malam'].map((period) => makeNode({ period }));
  const clock = makeNode();
  const period = makeNode();
  const activity = makeNode();
  const motion = makeNode();
  const lists = {
    '.user-pro-coop-suite .coop-switch': switches,
    '.user-pro-coop-suite .coop-device-status-row': statusRows,
    '.user-pro-devices [data-pro-device-key]': deviceRows,
    '.user-pro-coop-suite .coop-period-button': periods,
  };
  const singles = {
    '#pro-coop-clock': clock,
    '#pro-coop-period': period,
    '#pro-coop-activity': activity,
    '#pro-coop-motion-gentle': motion,
  };
  const root = {
    querySelector(selector) { return singles[selector] || null; },
    querySelectorAll(selector) { return lists[selector] || []; },
  };

  proDashboard.updateProCoopDashboard(root, {
    controls: { lighting: true, music: false, waterValve: true },
    periodPreference: 'sore',
    periodLabel: 'Sore',
    clock: '12:14',
    datetime: '2026-11-25T05:14:00.000Z',
    activityLabel: 'Ayam bergerak santai',
    motionPreference: 'gentle',
  });

  assert.deepEqual(switches.map((button) => button.getAttribute('aria-pressed')), ['true', 'false', 'true']);
  assert.deepEqual(statusRows.map((row) => row.querySelector('strong').textContent), ['ON', 'OFF', 'ON']);
  assert.deepEqual(deviceRows.map((row) => row.querySelector('.chip').textContent), ['Menyala', 'Mati', 'Terbuka']);
  assert.deepEqual(periods.map((button) => button.getAttribute('aria-pressed')), ['false', 'false', 'true', 'false']);
  assert.equal(clock.textContent, '12:14');
  assert.equal(clock.dateTime, '2026-11-25T05:14:00.000Z');
  assert.equal(period.textContent, 'Sore');
  assert.equal(activity.textContent, 'Ayam bergerak santai');
  assert.equal(motion.checked, true);
});

test('Pro scene state maps device controls, time period, and motion preference', () => {
  assert.equal(typeof proDashboard.getProCoop3DState, 'function');
  if (typeof proDashboard.getProCoop3DState !== 'function') return;
  assert.deepEqual(proDashboard.getProCoop3DState({
    controls: { lighting: true, music: false, waterValve: true },
  }, 'sore', 'gentle'), {
    lamp: true,
    music: false,
    valve: true,
    period: 'sore',
    motion: 'gentle',
  });
});

test('Pro scene binds system time only in automatic mode and disposes on rerender', async () => {
  assert.equal(typeof proDashboard.mountProCoop3D, 'function');
  if (typeof proDashboard.mountProCoop3D !== 'function') return;

  const root = { dataset: {}, isConnected: true };
  const calls = { initial: null, bound: 0, unbound: 0, disposed: 0 };
  const sceneApi = {
    mountCoop3D(_root, initial) {
      calls.initial = initial;
      return { dispose() { calls.disposed += 1; } };
    },
    bindRepoPeriod() {
      calls.bound += 1;
      return () => { calls.unbound += 1; };
    },
  };
  const cleanup = proDashboard.mountProCoop3D(root, {
    controls: { lighting: false, music: true, waterValve: false },
  }, {
    period: 'sore',
    periodPreference: 'auto',
    motion: 'gentle',
    loadScene: async () => sceneApi,
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls.initial, { lamp: false, music: true, valve: false, period: 'sore', motion: 'gentle' });
  assert.equal(calls.bound, 1);
  cleanup();
  assert.equal(calls.unbound, 1);
  assert.equal(calls.disposed, 1);
});

test('Pro scene manual period skips automatic system-time binding', async () => {
  assert.equal(typeof proDashboard.mountProCoop3D, 'function');
  if (typeof proDashboard.mountProCoop3D !== 'function') return;

  const root = { dataset: {}, isConnected: true };
  let bound = 0;
  const sceneApi = {
    mountCoop3D(_root, initial) {
      assert.equal(initial.period, 'malam');
      return { dispose() {} };
    },
    bindRepoPeriod() {
      bound += 1;
      return () => {};
    },
  };
  const cleanup = proDashboard.mountProCoop3D(root, { controls: {} }, {
    period: 'malam',
    periodPreference: 'malam',
    loadScene: async () => sceneApi,
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(bound, 0);
  cleanup();
});

test('Pro control updates reuse the renderer and change scene state in place', async () => {
  const root = { dataset: {}, isConnected: true };
  const calls = { mounted: 0, bound: 0, unbound: 0, disposed: 0, updates: [] };
  const sceneApi = {
    mountCoop3D(_root, initial) {
      calls.mounted += 1;
      calls.updates.push(initial);
      return {
        setState(next) { calls.updates.push(next); },
        dispose() { calls.disposed += 1; },
      };
    },
    bindRepoPeriod() {
      calls.bound += 1;
      return () => { calls.unbound += 1; };
    },
  };
  const handle = proDashboard.mountProCoop3D(root, {
    controls: { lighting: false, music: false, waterValve: false },
  }, {
    period: 'siang',
    periodPreference: 'auto',
    loadScene: async () => sceneApi,
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(typeof handle.update, 'function');
  if (typeof handle.update !== 'function') return;

  handle.update({ controls: { lighting: true, music: false, waterValve: false } }, {
    period: 'sore',
    periodPreference: 'sore',
    motion: 'gentle',
  });
  assert.deepEqual(calls.updates.at(-1), { lamp: true, music: false, valve: false, period: 'sore', motion: 'gentle' });
  assert.equal(calls.mounted, 1);
  assert.equal(calls.bound, 1);
  assert.equal(calls.unbound, 1);
  assert.equal(calls.disposed, 0);

  handle.update({ controls: { lighting: true, music: true, waterValve: false } }, {
    period: 'siang',
    periodPreference: 'auto',
    motion: 'auto',
  });
  assert.deepEqual(calls.updates.at(-1), { lamp: true, music: true, valve: false, period: 'siang', motion: 'auto' });
  assert.equal(calls.mounted, 1);
  assert.equal(calls.bound, 2);
  handle();
  assert.equal(calls.unbound, 2);
  assert.equal(calls.disposed, 1);
});

test('Pro scene keeps the photo when the Three.js module cannot load', async () => {
  assert.equal(typeof proDashboard.mountProCoop3D, 'function');
  if (typeof proDashboard.mountProCoop3D !== 'function') return;
  const root = { dataset: {}, isConnected: true };
  const cleanup = proDashboard.mountProCoop3D(root, { controls: {} }, {
    period: 'siang',
    loadScene: async () => { throw new Error('module unavailable'); },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(root.dataset.coopStatus, 'fallback');
  cleanup();
});

test('late Pro scene import is ignored after leaving the dashboard route', async () => {
  assert.equal(typeof proDashboard.mountProCoop3D, 'function');
  if (typeof proDashboard.mountProCoop3D !== 'function') return;

  let resolveScene;
  let mounted = 0;
  const root = { dataset: {}, isConnected: true };
  const cleanup = proDashboard.mountProCoop3D(root, { controls: {} }, {
    period: 'siang',
    loadScene: () => new Promise((resolve) => { resolveScene = resolve; }),
  });
  await Promise.resolve();
  cleanup();
  resolveScene({
    mountCoop3D() {
      mounted += 1;
      return { dispose() {} };
    },
    bindRepoPeriod() { return () => {}; },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mounted, 0);
  assert.equal(root.dataset.coopStatus, 'disposed');
});
