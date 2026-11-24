import { initHeroLottie } from './hero-lottie.mjs?v=hero-lottie-2';

/* Landing page — interaktif.

   - Nav sticky + scroll progress bar
   - Pratinjau tema (malam default, tersimpan di localStorage)
   - Demo kandang: toggle aktuator memengaruhi suhu, kelembapan, grafik
   - Panel hero ikut menampilkan angka yang sama
   - Counter angka statistik
   - Reveal progressive-enhancement (konten terlihat tanpa JS) */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const REVEAL_SELECTOR = [
  '.sec-head', '.cell', '.step', '.console', '.vs', '.stat',
  '.showcase-copy', '.showcase-visual', '.hero-copy', '.hero-panel',
  '.faq', '.cta-in > *',
].join(', ');

/* ---------- nav + progress ---------- */

function initScrollUI() {
  const nav = document.querySelector('#nav');
  const bar = document.querySelector('#scroll-bar');
  let ticking = false;

  const update = () => {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min((window.scrollY / max) * 100, 100) : 0;
      bar.style.width = `${pct}%`;
    }
    ticking = false;
  };

  update();
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

/* ---------- tema ---------- */

const THEME_KEY = 'smart-poultry-landing-theme';

function initTheme() {
  const buttons = [...document.querySelectorAll('[data-theme-set]')];
  if (!buttons.length) return;

  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* diblokir */ }
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.themeSet)));

  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* abaikan */ }
  if (saved === 'siang' || saved === 'sore' || saved === 'malam') apply(saved);
}

/* ---------- demo kandang ---------- */

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

/* Efek tiap aktuator terhadap sensor. */
const EFFECT = {
  valve: { temp: -0.8, hum: 5 },
  lamp: { temp: 1.4, hum: -3 },
  music: { temp: -0.3, hum: 1 },
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
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#071410" stroke="#55B82A" stroke-width="2">`
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

  // cermin di panel hero
  const hTemp = document.querySelector('#hero-temp');
  const hHum = document.querySelector('#hero-hum');
  if (hTemp) hTemp.textContent = temp.toFixed(1);
  if (hHum) hHum.textContent = String(hum);

  const stateEl = document.querySelector('#demo-temp-state');
  if (stateEl) {
    const warn = temp > 32 || temp < 24;
    stateEl.textContent = warn ? 'Di luar ambang' : 'Dalam batas';
    document.querySelector('.ro-v')?.classList.toggle('is-warn', warn);
  }

  document.querySelectorAll('[data-demo-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(state[btn.dataset.demoToggle]));
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
      const name = key === 'valve' ? 'valve air' : key === 'lamp' ? 'lampu kandang' : 'musik klasik';
      say(`${LABEL[key][state[key] ? 'on' : 'off']} · ${name}.`);
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

/* ---------- counter angka ---------- */

function initCounters() {
  const targets = [...document.querySelectorAll('[data-count]')];
  if (!targets.length || prefersReducedMotion) return;

  const animate = (el) => {
    const end = parseFloat(el.dataset.count);
    if (!Number.isFinite(end)) return;
    const dur = 1000;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(end);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    targets.forEach(animate);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      animate(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  targets.forEach((el) => io.observe(el));
}

/* ---------- FAQ: satu terbuka pada satu waktu ---------- */

function initFaq() {
  const items = [...document.querySelectorAll('#faq .q')];
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      // event 'toggle' async: tutup yang lain pada tick berikutnya agar
      // tidak bertabrakan dengan perubahan state milik browser.
      queueMicrotask(() => {
        items.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  });
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

initScrollUI();
initTheme();
initDemo();
initCounters();
initFaq();
initReveal();
initActiveNav();
initHeroLottie({
  container: document.querySelector('#hero-chicken-animation'),
  fallback: document.querySelector('#hero-hen-poster'),
  observerTarget: document.querySelector('.hero-hen-scene'),
  control: document.querySelector('#hero-hen-toggle'),
  lottie: window.lottie,
  reducedMotion: prefersReducedMotion,
  IntersectionObserverCtor: window.IntersectionObserver,
  visibilityTarget: document,
  animationPath: './src/assets/lottie/coop-hen.json?v=photo-1',
});
