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

/* ---------- mini game telur (hero kiri) ---------- */

const MINI = {
  egg: './src/assets/eggs/egg-trim.webp',
  cracked: './src/assets/eggs/cracked-trim.webp',
  hand: './src/assets/eggs/hand.webp',
  grip: './src/assets/eggs/hand gripping transparent.webp',
};

/* 9 telur: 3 baris, sedikit bertumpuk */
const MINI_LAYOUT = [
  { x: 24, y: 66, s: 1.00 }, { x: 44, y: 63, s: .93 }, { x: 64, y: 66, s: 1.06 },
  { x: 34, y: 48, s: .90 }, { x: 54, y: 45, s: 1.02 }, { x: 74, y: 48, s: .95 },
  { x: 28, y: 31, s: .88 }, { x: 48, y: 29, s: .97 }, { x: 66, y: 32, s: .91 },
];

const GROUND = 0.82;        // garis dataran (porsi tinggi panggung)
const CRACK_AT = 0.30;      // jarak jatuh yang membuat telur pecah

function initMiniEggGame() {
  const stage = document.querySelector('#mini-stage');
  const wrap = document.querySelector('#mini-eggs');
  const floor = document.querySelector('#mini-floor');
  if (!stage || !wrap) return;

  // kursor + telur yang dipegang
  const cursor = document.createElement('div');
  cursor.className = 'mini-cursor';
  cursor.innerHTML = '<img alt="" draggable="false">';
  stage.appendChild(cursor);
  const cursorImg = cursor.querySelector('img');

  const held = document.createElement('img');
  held.className = 'mini-held';
  held.src = MINI.egg;
  held.alt = '';
  held.draggable = false;
  stage.appendChild(held);

  const st = { holding: null, px: 0.5, py: 0.5 };
  let remaining = 0;

  const setCursor = (src) => {
    if (cursorImg.getAttribute('src') !== src) cursorImg.src = src;
  };

  const rel = (ev) => {
    const r = stage.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height };
  };

  const eggAt = (ev) => {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const slot = el?.closest('.mini-egg');
    return slot && !slot.classList.contains('is-gone') ? slot : null;
  };

  const spawn = () => {
    wrap.innerHTML = '';
    remaining = MINI_LAYOUT.length;
    MINI_LAYOUT.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'mini-egg';
      el.style.left = `${p.x}%`;
      el.style.top = `${p.y}%`;
      el.style.zIndex = String(10 + i);
      el.style.setProperty('--s', String(p.s));
      el.innerHTML = `<img src="${MINI.egg}" alt="Telur ${i + 1}" draggable="false">`;
      wrap.appendChild(el);
    });
  };

  const drop = (x, y) => {
    const landY = Math.max(y, GROUND);
    // pecah bila jatuh dari ketinggian: jarak titik lepas -> dataran
    const broke = landY - y > CRACK_AT;

    // selalu mulai sebagai telur utuh; pecah hanya SETELAH mendarat
    const fe = document.createElement('div');
    fe.className = 'mini-floor-egg';
    fe.style.left = `${Math.min(94, Math.max(6, x * 100))}%`;
    fe.style.setProperty('--from', `${y * 100}%`);
    fe.style.setProperty('--to', `${landY * 100}%`);
    fe.style.top = `${landY * 100}%`;
    fe.style.setProperty('--rot', `${Math.random() * 16 - 8}deg`);

    const img = document.createElement('img');
    img.src = MINI.egg;
    img.alt = '';
    img.draggable = false;
    fe.appendChild(img);
    floor.appendChild(fe);

    if (!broke) return;

    // setelah animasi jatuh selesai, baru berubah jadi telur pecah
    fe.addEventListener('animationend', () => {
      fe.classList.add('is-cracked');
      img.src = MINI.cracked;
    }, { once: true });
  };

  stage.addEventListener('pointermove', (ev) => {
    const p = rel(ev);
    st.px = p.x; st.py = p.y;

    const r = stage.getBoundingClientRect();
    cursor.style.transform = `translate(${ev.clientX - r.left}px, ${ev.clientY - r.top}px) translate(-28%, -18%)`;
    cursor.classList.add('is-visible');

    if (st.holding) {
      held.style.left = `${p.x * 100}%`;
      held.style.top = `${p.y * 100}%`;
      setCursor(MINI.grip);
      return;
    }

    const over = eggAt(ev);
    document.querySelectorAll('.mini-egg.is-hot').forEach((e) => e.classList.remove('is-hot'));
    if (over) over.classList.add('is-hot');
    setCursor(over ? MINI.grip : MINI.hand);
  });

  stage.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-visible');
    document.querySelectorAll('.mini-egg.is-hot').forEach((e) => e.classList.remove('is-hot'));
  });

  stage.addEventListener('pointerdown', (ev) => {
    const p = rel(ev);
    st.px = p.x; st.py = p.y;

    const slot = eggAt(ev);
    if (!slot) {
      setCursor(MINI.grip);
      return;
    }

    slot.classList.add('is-gone');
    remaining -= 1;

    st.holding = { slot };
    held.style.left = `${p.x * 100}%`;
    held.style.top = `${p.y * 100}%`;
    held.classList.add('is-visible');
    setCursor(MINI.grip);
  });

  window.addEventListener('pointerup', (ev) => {
    if (!st.holding) return;
    const p = rel(ev);
    st.holding = null;
    held.classList.remove('is-visible');
    drop(p.x, p.y);
    setCursor(MINI.hand);

    if (remaining <= 0) {
      window.setTimeout(() => { spawn(); floor.innerHTML = ''; }, 900);
    }
  });

  spawn();
}

/* ---------- mini kandang (hero kanan) ---------- */

const MC = {
  base: './src/assets/kandang-ayam/clean',
  morning: 'chicken-morning.png',
  afternoon: 'chicken-afternoon.png',
  happy: 'chicken-happy.png',
  sleep: 'chicken-sleep.png',
  lampOn: 'lamp-on.png',
  lampOff: 'lamp-off.png',
  panel: 'panel.png',
  panelLamp: 'panel-lamp.png',
  panelMusic: 'panel-music.png',
  panelBoth: 'panel-both.png',
};

function initMiniCoop() {
  const root = document.querySelector('#mini-coop');
  if (!root) return;

  const lamp = root.querySelector('#mc-lamp');
  const glow = root.querySelector('#mc-glow');
  const panelImg = root.querySelector('#mc-panel-img');
  const btnLamp = root.querySelector('#mc-btn-lamp');
  const btnMusic = root.querySelector('#mc-btn-music');
  const chickens = [root.querySelector('#mc-top'), root.querySelector('#mc-bottom')];
  const notes = [...root.querySelectorAll('.mc-note')];
  const zzz = [...root.querySelectorAll('.mc-zzz')];

  const st = { lamp: false, music: false };

  const hour = new Date().getHours();
  const night = hour >= 18 || hour < 6;

  const render = () => {
    lamp.src = `${MC.base}/${st.lamp ? MC.lampOn : MC.lampOff}`;
    glow.classList.toggle('is-on', st.lamp);

    const chick = night ? MC.sleep : st.music ? MC.happy : st.lamp ? MC.morning : MC.afternoon;
    chickens.forEach((c) => {
      const src = `${MC.base}/${chick}`;
      if (c.getAttribute('src') !== src) c.src = src;
      c.classList.toggle('is-happy', !night && st.music);
    });

    notes.forEach((n) => n.classList.toggle('is-on', st.music && !night));
    zzz.forEach((z) => z.classList.toggle('is-on', night));

    panelImg.src = `${MC.base}/${st.music && st.lamp ? MC.panelBoth : st.music ? MC.panelMusic : st.lamp ? MC.panelLamp : MC.panel}`;
    btnLamp.setAttribute('aria-pressed', String(st.lamp));
    btnMusic.setAttribute('aria-pressed', String(st.music));
  };

  btnLamp.addEventListener('click', () => { st.lamp = !st.lamp; render(); });
  btnMusic.addEventListener('click', () => { st.music = !st.music; render(); });
  render();
}

initMiniEggGame();
initMiniCoop();
