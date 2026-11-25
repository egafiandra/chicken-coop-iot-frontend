/* Halaman "Ambil Telur" — interaksi ala game.

   Alur:
   1. Kursor di luar box  -> tangan terbuka (hand.webp)
   2. Kursor di dalam box -> tangan menggenggam (hand gripping)
   3. Klik di atas telur  -> telur terangkat, jumlah di box berkurang 1
      Klik di luar telur  -> genggaman kosong (tidak mengambil)
   4. Selama tombol ditahan, telur ikut kursor
   5. Saat dilepas, telur jatuh ke dataran. Bila jatuh dari ketinggian
      melewati ambang -> pecah (cracked egg), bila dekat dataran -> utuh.

   Semua posisi memakai persentase terhadap panggung agar responsif. */

const A = {
  egg: './src/assets/eggs/egg-trim.webp',
  cracked: './src/assets/eggs/cracked-trim.webp',
  hand: './src/assets/eggs/hand.webp',
  grip: './src/assets/eggs/hand gripping transparent.webp',
};

const GROUND_Y = 0.86;   // garis dataran (porsi tinggi panggung)
const TOTAL_EGGS = 9;
const CRACK_THRESHOLD = 0.30;  // jarak jatuh ke dataran yang membuat telur pecah

/* telur berbaris rapi: 3 baris x 3 kolom, berdekatan.
   Ukuran bervariasi halus; baris belakang sedikit lebih kecil (perspektif). */
const SIZES = [1.05, 0.95, 1.0, 0.92, 1.07, 0.98, 1.02, 0.9, 1.04];
const ROTS = [-4, 3, -2, 5, -3, 2, -5, 4, -1];

const LAYOUT = [0, 1, 2].flatMap((col) =>
  [0, 1, 2].map((row) => {
    const i = col + row * 3;
    return {
      x: 30 + col * 20,
      y: 17 + row * 13,
      rot: ROTS[i],
      scale: SIZES[i] * [0.88, 0.94, 1][row],
    };
  }),
);

const stage = document.querySelector('#stage');
const boxEl = document.querySelector('#box');
const boxEggs = document.querySelector('#box-eggs');
const floorEggs = document.querySelector('#floor-eggs');
const heldEgg = document.querySelector('#held-egg');
const hint = document.querySelector('#hint');
const countIn = document.querySelector('#count-in');
const countTaken = document.querySelector('#count-taken');

/* kursor kustom */
const cursor = document.createElement('div');
cursor.className = 'cursor';
cursor.innerHTML = '<img alt="" draggable="false">';
stage.appendChild(cursor);
const cursorImg = cursor.querySelector('img');

const state = {
  eggs: [],          // { el, alive, rot }
  taken: 0,
  holding: null,     // telur yang sedang dipegang
  pointer: { x: 0.5, y: 0.5 },
  inside: false,
};

/* ---------- util ---------- */

const pct = (v) => `${v}%`;

function setCursorImage(src) {
  if (cursorImg.getAttribute('src') === src) return;
  cursorImg.src = src;
}

/* posisi pointer relatif panggung, 0..1 */
function pointerRel(ev) {
  const r = stage.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left) / r.width,
    y: (ev.clientY - r.top) / r.height,
  };
}

/* apakah pointer berada di dalam area telur (layar) */
function eggUnderPointer(ev) {
  const el = document.elementFromPoint(ev.clientX, ev.clientY);
  if (!el) return null;
  const slot = el.closest('.egg-slot');
  if (!slot || slot.classList.contains('is-lifted')) return null;
  return slot;
}

/* telur utuh di dataran yang bisa diambil lagi */
function floorEggUnderPointer(ev) {
  const el = document.elementFromPoint(ev.clientX, ev.clientY);
  if (!el) return null;
  const fe = el.closest('.floor-egg');
  if (!fe) return null;
  if (fe.classList.contains('is-cracked') || fe.classList.contains('is-falling')) return null;
  return fe;
}

/* ---------- bangun telur di box ---------- */

function buildEggs() {
  LAYOUT.slice(0, TOTAL_EGGS).forEach((pos, i) => {
    const el = document.createElement('div');
    el.className = 'egg-slot';
    el.style.left = pct(pos.x);
    el.style.top = pct(pos.y);
    el.style.zIndex = String(10 + (pos.y ?? 0));
    el.style.setProperty('--s', String(pos.scale ?? 1));

    const img = document.createElement('img');
    img.src = A.egg;
    img.alt = `Telur ${i + 1}`;
    img.draggable = false;
    el.appendChild(img);

    boxEggs.appendChild(el);
    state.eggs.push({ el, alive: true, rot: pos.rot, scale: pos.scale });
  });
  updateCounters();
}

function updateCounters() {
  const alive = state.eggs.filter((e) => e.alive).length;
  countIn.textContent = String(alive);
  countTaken.textContent = String(state.taken);
}

/* ---------- kursor ---------- */

function updateCursor(ev) {
  const r = stage.getBoundingClientRect();
  const x = ev.clientX - r.left;
  const y = ev.clientY - r.top;
  cursor.style.transform = `translate(${x}px, ${y}px) translate(-28%, -18%)`;
}

function refreshCursorMode(ev) {
  if (state.holding) {
    setCursorImage(A.grip);
    return;
  }
  const overEgg = eggUnderPointer(ev) || floorEggUnderPointer(ev);
  const overBox = ev.target.closest?.('#box');

  // di dalam box atau di atas telur -> tangan menggenggam
  setCursorImage(overEgg || overBox ? A.grip : A.hand);
}

function highlightEggs(hovered) {
  state.eggs.forEach((e) => {
    if (!e.alive) return;
    e.el.classList.toggle('is-hot', e.el === hovered);
  });
}

/* ---------- ambil & lepas ---------- */

function beginHold(rot, scale) {
  state.holding = { rot, scale };
  heldEgg.src = A.egg;
  heldEgg.style.left = pct(state.pointer.x * 100);
  heldEgg.style.top = pct(state.pointer.y * 100);
  heldEgg.classList.add('is-visible');
  setCursorImage(A.grip);
  hint.textContent = 'Lepas untuk menjatuhkan telur.';
  hint.classList.remove('is-faded');
}

function takeEgg(slot) {
  const entry = state.eggs.find((e) => e.el === slot && e.alive);
  if (!entry) return;

  entry.alive = false;
  state.taken += 1;
  entry.el.classList.add('is-lifted');
  updateCounters();

  beginHold(entry.rot, entry.scale);
}

/* telur di dataran: angkat lagi tanpa mengubah hitungan */
function takeFloorEgg(el) {
  const rot = Number(el.dataset.rot || 0);
  const scale = Number(el.dataset.scale || 1);
  el.remove();
  beginHold(rot, scale);
}

function releaseEgg() {
  if (!state.holding) return;

  const { rot, scale } = state.holding;
  state.holding = null;
  heldEgg.classList.remove('is-visible');

  const dropY = state.pointer.y;
  const dropX = state.pointer.x;
  const landY = Math.max(dropY, GROUND_Y);

  // pecah bila jarak jatuh (dari titik lepas ke dataran) melewati ambang
  const broke = landY - dropY > CRACK_THRESHOLD;

  spawnFloorEgg(dropX, dropY, broke, rot, scale);

  hint.textContent = broke
    ? 'Telur pecah — jatuh dari terlalu tinggi.'
    : 'Telur selamat — jatuh dekat dataran.';
  window.setTimeout(() => hint.classList.add('is-faded'), 2200);
}

function spawnFloorEgg(x, y, broke, rot, scale) {
  const landY = Math.max(y, GROUND_Y);
  const el = document.createElement('div');
  el.className = 'floor-egg is-falling';
  el.style.left = pct(x * 100);
  el.style.top = pct(y * 100);
  el.style.setProperty('--rot', `${rot}deg`);
  el.dataset.rot = String(rot);
  el.dataset.scale = String(scale ?? 1);
  el.style.setProperty('--from', pct(y * 100));
  el.style.setProperty('--land', pct(landY * 100));
  el.style.setProperty('--w', `${8.6 * (scale ?? 1)}%`);

  const img = document.createElement('img');
  img.src = A.egg;
  img.alt = 'Telur';
  img.draggable = false;
  el.appendChild(img);
  floorEggs.appendChild(el);

  // setelah mendarat: pecah berubah gambar, utuh tetap
  el.addEventListener('animationend', () => {
    el.classList.remove('is-falling');
    el.classList.add('is-landed');
    el.style.top = pct(landY * 100);
    if (broke) {
      el.classList.add('is-cracked');
      img.src = A.cracked;
      img.alt = 'Telur pecah';
      el.style.setProperty('--w', `${13 * (scale ?? 1)}%`);
    }
  }, { once: true });
}

/* ---------- event ---------- */

function onMove(ev) {
  state.pointer = pointerRel(ev);
  state.inside = true;
  cursor.classList.add('is-visible');
  updateCursor(ev);

  const hovered = state.holding ? null : eggUnderPointer(ev);
  highlightEggs(hovered);
  document.querySelectorAll('.floor-egg.is-hot').forEach((e) => e.classList.remove('is-hot'));
  if (!state.holding) floorEggUnderPointer(ev)?.classList.add('is-hot');
  refreshCursorMode(ev);

  if (state.holding) {
    const r = stage.getBoundingClientRect();
    heldEgg.style.left = `${((ev.clientX - r.left) / r.width) * 100}%`;
    heldEgg.style.top = `${((ev.clientY - r.top) / r.height) * 100}%`;
  }
}

function onLeave() {
  state.inside = false;
  cursor.classList.remove('is-visible');
  highlightEggs(null);
}

function onDown(ev) {
  if (ev.button !== undefined && ev.button !== 0) return;
  state.pointer = pointerRel(ev);

  const floor = floorEggUnderPointer(ev);
  const slot = eggUnderPointer(ev);

  if (floor) {
    takeFloorEgg(floor);
  } else if (slot) {
    takeEgg(slot);
  } else {
    // klik di luar telur: hanya genggaman kosong
    setCursorImage(A.grip);
    hint.textContent = 'Tidak ada telur di titik itu.';
    hint.classList.remove('is-faded');
    window.setTimeout(() => hint.classList.add('is-faded'), 1600);
  }
}

function onUp(ev) {
  if (state.holding) {
    state.pointer = pointerRel(ev);
    releaseEgg();
  }
  refreshCursorMode(ev);
}

/* ---------- init ---------- */

buildEggs();

stage.addEventListener('pointermove', onMove, { passive: true });
stage.addEventListener('pointerdown', onDown);
window.addEventListener('pointerup', onUp);
stage.addEventListener('pointerleave', onLeave);
stage.addEventListener('contextmenu', (e) => e.preventDefault());

// sembunyikan petunjuk awal setelah interaksi pertama
stage.addEventListener('pointerdown', () => hint.classList.add('is-faded'), { once: true });
