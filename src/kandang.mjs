/* Kandang ayam interaktif.

   Logika:
   - Tombol lampu  -> lampu menyala, cahaya muncul, ayam bangun
   - Tombol musik  -> ayam senang (goyang), panel musik menyala
   - Malam hari    -> ayam tidur, zzz muncul
   - Musik + lampu -> ayam paling senang

   Semua state diturunkan dari 3 variabel: lampOn, musicOn, isNight. */

const A = './src/assets/kandang-ayam/clean';
const IMG = {
  chickenMorning: `${A}/chicken-morning.png`,
  chickenAfternoon: `${A}/chicken-afternoon.png`,
  chickenHappy: `${A}/chicken-happy.png`,
  chickenSleep: `${A}/chicken-sleep.png`,
  lampOff: `${A}/lamp-off.png`,
  lampOn: `${A}/lamp-on.png`,
  panelIdle: `${A}/panel.png`,
  panelLamp: `${A}/panel-lamp.png`,
  panelMusic: `${A}/panel-music.png`,
  panelBoth: `${A}/panel-both.png`,
};

const NIGHT_START = 18;   // jam 18.00 -> malam
const NIGHT_END = 6;      // jam 06.00 -> pagi

const stage = document.querySelector('#stage');
const lamp = document.querySelector('#lamp');
const lampGlow = document.querySelector('#lamp-glow');
const chickens = [document.querySelector('#chicken-top'), document.querySelector('#chicken-bottom')];
const zzz = [document.querySelector('#zzz-top'), document.querySelector('#zzz-bottom')];
const notes = [...document.querySelectorAll('.note')];
const panelImg = document.querySelector('#panel-img');
const btnLamp = document.querySelector('#btn-lamp');
const btnMusic = document.querySelector('#btn-music');
const clock = document.querySelector('#clock');
const hint = document.querySelector('#hint');
const audio = document.querySelector('#music');

const state = { lampOn: false, musicOn: false, isNight: false };

/* ---------- waktu ---------- */

function currentHour() {
  return new Date().getHours();
}

function isNightNow() {
  const h = currentHour();
  return h >= NIGHT_START || h < NIGHT_END;
}

function renderClock() {
  const d = new Date();
  clock.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ---------- render ---------- */

function chickenImage() {
  if (state.isNight) return IMG.chickenSleep;
  if (state.musicOn) return IMG.chickenHappy;
  if (state.lampOn) return IMG.chickenMorning;
  return IMG.chickenAfternoon;
}

function render() {
  const sleeping = state.isNight;

  // lampu
  lamp.src = state.lampOn ? IMG.lampOn : IMG.lampOff;
  lampGlow.classList.toggle('is-on', state.lampOn);

  // ayam
  const src = chickenImage();
  chickens.forEach((c) => {
    if (c.getAttribute('src') !== src) c.src = src;
    c.classList.toggle('is-sleeping', sleeping);
    c.classList.toggle('is-happy', !sleeping && state.musicOn);
  });

  // zzz hanya saat tidur
  zzz.forEach((z) => z.classList.toggle('is-on', sleeping));

  // not musik hanya saat musik nyala
  notes.forEach((n) => n.classList.toggle('is-on', state.musicOn && !sleeping));

  // panel: satu gambar, berganti sesuai kondisi (musik diprioritaskan)
  btnLamp.setAttribute('aria-pressed', String(state.lampOn));
  btnMusic.setAttribute('aria-pressed', String(state.musicOn));
  panelImg.src = state.musicOn && state.lampOn ? IMG.panelBoth
    : state.musicOn ? IMG.panelMusic
    : state.lampOn ? IMG.panelLamp
    : IMG.panelIdle;

  // panggung
  stage.classList.toggle('is-night', sleeping);

  // status
  const parts = [
    state.lampOn ? 'lampu nyala' : 'lampu mati',
    state.musicOn ? 'musik nyala' : 'musik mati',
  ];
  parts.push(sleeping ? 'ayam tidur' : state.musicOn ? 'ayam senang' : 'ayam santai');
  hint.textContent = parts.join(' · ');
}

/* ---------- aksi ---------- */

function toggleLamp() {
  state.lampOn = !state.lampOn;
  render();
}

function toggleMusic() {
  state.musicOn = !state.musicOn;

  if (state.musicOn) {
    // audio opsional: kalau file tidak ada, tetap jalan tanpa suara
    audio.play?.().catch(() => {});
  } else {
    audio.pause?.();
  }
  render();
}

function syncNight() {
  const night = isNightNow();
  if (night !== state.isNight) {
    state.isNight = night;
    render();
  }
  renderClock();
}

/* ---------- init ---------- */

state.isNight = isNightNow();
render();
renderClock();

btnLamp.addEventListener('click', toggleLamp);
btnMusic.addEventListener('click', toggleMusic);

// cek pergantian jam tiap menit
window.setInterval(syncNight, 60_000);

// hormati preferensi kurangi gerak
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reduce-motion');
}
