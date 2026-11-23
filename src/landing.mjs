/* Landing page — interaktif.

   Fitur:
   - Nav sticky yang berubah saat scroll.
   - Pratinjau tema siang/sore/malam (tersimpan di localStorage).
   - Demo kandang: toggle valve/lampu/musik yang mengubah suhu, kelembapan,
     grafik, dan label — meniru perilaku panel pengguna.
   - Animasi reveal progressive-enhancement (konten tetap terlihat tanpa JS). */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const REVEAL_SELECTOR = [
  '.sec-head', '.feat', '.demo', '.vs', '.band-item',
  '.showcase-copy', '.showcase-photo', '.hero-photo',
  '.cta-in > *',
].join(', ');

/* ---------- nav sticky ---------- */

function initStickyNav() {
  const nav = document.querySelector('#nav');
  if (!nav) return;
  let ticking = false;
  const update = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
    ticking = false;
  };
  update();
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
}

/* ---------- pratinjau tema ---------- */

const THEME_KEY = 'smart-poultry-landing-theme';

function initTheme() {
  const buttons = [...document.querySelectorAll('[data-theme-set]')];
  if (!buttons.length) return;

  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* penyimpanan diblokir */ }
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.themeSet)));

  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* abaikan */ }
  if (saved === 'siang' || saved === 'sore' || saved === 'malam') apply(saved);
}

/* ---------- demo kandang interaktif ---------- */

const BASE = { temp: 28.4, hum: 67 };

const state = {
  valve: false,
  lamp: false,
  music: false,
  series: {
    labels: ['08:00', '08:06', '08:12', '08:18', '08:24', '08:30'],
    temp: [27.6, 27.9, 28.1, 28.0, 28.3, 28.4],
    hum: [71, 70, 69, 68, 67, 67],
  },
};

/* Efek tiap aktuator terhadap sensor — sengaja sederhana dan dapat dijelaskan. */
const EFFECT = {
  valve: { temp: -0.8, hum: 5 },   // air mengalir: lebih sejuk & lembap
  lamp: { temp: 1.4, hum: -3 },    // lampu menyala: lebih hangat & kering
  music: { temp: -0.3, hum: 1 },   // musik: ayam tenang, sedikit stabil
};

const LABEL = {
  valve: { on: 'Terbuka', off: 'Tertutup' },
  lamp: { on: 'Menyala', off: 'Mati' },
  music: { on: 'Memutar', off: 'Mati' },
};

function computeReading() {
  let temp = BASE.temp;
  let hum = BASE.hum;
  for (const key of Object.keys(EFFECT)) {
    if (!state[key]) continue;
    temp += EFFECT[key].temp;
    hum += EFFECT[key].hum;
  }
  return { temp: Math.round(temp * 10) / 10, hum: Math.round(hum) };
}

/* Bangun path SVG dari deret angka. */
function buildPath(values, width, height, min, max) {
  const pad = 10;
  const span = max - min || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y];
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts.at(-1)[0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;
  return { line, area, pts };
}

function renderChart() {
  const svg = document.querySelector('#chart');
  if (!svg) return;

  const W = 520;
  const H = 200;
  const { temp, hum } = state.series;

  // Skala terpisah per seri: suhu (°C) dan kelembapan (%) beda satuan,
  // jadi menyamakan skala membuat salah satu garis tampak rata.
  const tempMin = Math.min(...temp) - 1.2;
  const tempMax = Math.max(...temp) + 1.2;
  const humMin = Math.min(...hum) - 4;
  const humMax = Math.max(...hum) + 4;

  const t = buildPath(temp, W, H, tempMin, tempMax);
  const h = buildPath(hum, W, H, humMin, humMax);

  document.querySelector('#chart-temp-line')?.setAttribute('d', t.line);
  document.querySelector('#chart-temp-area')?.setAttribute('d', t.area);
  document.querySelector('#chart-hum-line')?.setAttribute('d', h.line);

  const dots = document.querySelector('#chart-dots');
  if (dots) {
    dots.innerHTML = t.pts.map(([x, y], i) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#0F2A1B" stroke="#7BD64E" stroke-width="2">`
      + `<title>${state.series.labels[i]}: ${temp[i]} °C</title></circle>`).join('');
  }

  const points = document.querySelector('#chart-points');
  if (points) points.textContent = String(temp.length);
}

function renderDemo() {
  const { temp, hum } = computeReading();

  const tempEl = document.querySelector('#demo-temp');
  const humEl = document.querySelector('#demo-hum');
  if (tempEl) tempEl.textContent = temp.toFixed(1);
  if (humEl) humEl.textContent = String(hum);

  const stateEl = document.querySelector('#demo-temp-state');
  if (stateEl) {
    const warn = temp > 32 || temp < 24;
    stateEl.textContent = warn ? 'Di luar ambang' : 'Dalam batas';
    document.querySelector('.readout-value')?.classList.toggle('is-warn', warn);
  }

  // cermin di mockup ponsel
  const psTemp = document.querySelector('#ps-temp');
  const psHum = document.querySelector('#ps-hum');
  if (psTemp) psTemp.textContent = temp.toFixed(1);
  if (psHum) psHum.textContent = String(hum);
  const psState = document.querySelector('#ps-temp-state');
  if (psState) psState.textContent = (temp > 32 || temp < 24) ? 'Di luar ambang' : 'Dalam batas';

  // label & status tombol
  document.querySelectorAll('[data-demo-toggle]').forEach((btn) => {
    const key = btn.dataset.demoToggle;
    btn.setAttribute('aria-pressed', String(state[key]));
  });
  document.querySelectorAll('[data-demo-label]').forEach((el) => {
    const key = el.dataset.demoLabel;
    el.textContent = state[key] ? LABEL[key].on : LABEL[key].off;
  });

  renderChart();
}

function pushReading() {
  const { temp, hum } = computeReading();
  state.series.temp = [...state.series.temp.slice(1), temp];
  state.series.hum = [...state.series.hum.slice(1), hum];
}

function initDemo() {
  const toggles = [...document.querySelectorAll('[data-demo-toggle]')];
  if (!toggles.length) return;

  const note = document.querySelector('#demo-note');
  const say = (msg) => { if (note) note.textContent = msg; };

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.demoToggle;
      state[key] = !state[key];
      pushReading();
      renderDemo();
      say(`${LABEL[key][state[key] ? 'on' : 'off']} · ${key === 'valve' ? 'valve air' : key === 'lamp' ? 'lampu kandang' : 'musik klasik'}.`);
    });
  });

  document.querySelector('#demo-reset')?.addEventListener('click', () => {
    state.valve = false;
    state.lamp = false;
    state.music = false;
    state.series = {
      labels: ['08:00', '08:06', '08:12', '08:18', '08:24', '08:30'],
      temp: [27.6, 27.9, 28.1, 28.0, 28.3, 28.4],
      hum: [71, 70, 69, 68, 67, 67],
    };
    renderDemo();
    say('Mode simulasi — tidak ada perangkat nyata.');
  });

  renderDemo();
}

/* ---------- jam + umur pembacaan ---------- */

function initClock() {
  const clock = document.querySelector('#ps-clock');
  const age = document.querySelector('#live-age');
  if (!clock) return;

  let seconds = 12;
  const tick = () => {
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    seconds += 1;
    if (age) age.textContent = `Diperbarui ${seconds} detik lalu`;
    if (seconds > 59) seconds = 1;
  };
  tick();
  window.setInterval(tick, 5000);
}

/* ---------- reveal ---------- */

function revealAll(targets) {
  targets.forEach((el) => {
    el.classList.remove('reveal');
    el.classList.add('is-revealed');
  });
}

function initReveal() {
  const targets = [...document.querySelectorAll(REVEAL_SELECTOR)];
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealAll(targets);
    return;
  }

  let observer;
  try {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  } catch {
    revealAll(targets);
    return;
  }

  targets.forEach((el) => el.classList.add('reveal'));
  targets.forEach((el) => observer.observe(el));

  window.setTimeout(() => {
    targets.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    });
  }, 2500);
}

/* ---------- nav aktif ---------- */

function initActiveNav() {
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) map.set(section, link);
  });
  if (!map.size) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.removeAttribute('aria-current'));
      map.get(entry.target)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  map.forEach((_, section) => observer.observe(section));
}

initStickyNav();
initTheme();
initDemo();
initClock();
initReveal();
initActiveNav();
