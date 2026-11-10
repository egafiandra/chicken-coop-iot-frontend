import {
  addSimulatedDetection,
  addSimulatedEggEvent,
  filterEvents,
  createInitialState,
  normalizePage,
  resetDemo,
  setHistoryFilter,
  setLightColor,
  simulateEspTrigger,
  toggleControl,
  toggleFeedScenario,
} from './state.mjs';

const app = document.querySelector('#app');
const liveAnnouncer = document.querySelector('#live-announcer');
let state = createInitialState();

const pages = [
  { id: 'home', label: 'Ringkasan', icon: 'home', title: 'Ringkasan kandang', subtitle: 'Awal pemantauan untuk kandang ayam.' },
  { id: 'monitor', label: 'Monitoring', icon: 'activity', title: 'Monitoring kandang', subtitle: 'Pembacaan udara, pakan, air, dan sensor berat.' },
  { id: 'controls', label: 'Kontrol IoT', icon: 'sliders', title: 'Kontrol kandang', subtitle: 'Atur valve air, lampu, dan musik.' },
  { id: 'camera', label: 'Kamera dan YOLO', icon: 'camera', title: 'Kamera dan deteksi', subtitle: 'Area kamera dan catatan hasil deteksi.' },
  { id: 'eggs', label: 'Telur dan berat', icon: 'egg', title: 'Telur dan sensor berat', subtitle: 'Indikator berat dan catatan kejadian telur.' },
  { id: 'history', label: 'Riwayat', icon: 'history', title: 'Riwayat aktivitas', subtitle: 'Pembacaan dan aktivitas setelah perangkat terhubung.' },
];

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5M9 21v-6h6v6"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  camera: '<path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  egg: '<path d="M12 3c-3.8 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3.2-11-7-11Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  water: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  feed: '<path d="M4 10h16l-1.5 9h-13L4 10Z"/><path d="M7 7c1-2 3-2 4 0M13 7c1-2 3-2 4 0M8 14h.01M12 14h.01M16 14h.01"/>',
  light: '<path d="M9 18h6M10 21h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.4-1.5 2.5h-4c-.2-1.1-.6-1.8-1.5-2.5Z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  weight: '<path d="M5 4h14l2 17H3L5 4Z"/><path d="M12 8v4l3 2"/><circle cx="12" cy="8" r="1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>',
};

function icon(name, className = '') {
  const paths = iconPaths[name] || iconPaths.info;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function currentPage() {
  return normalizePage(window.location.hash.replace(/^#\/?/, ''));
}

function navLink(page, activePage) {
  const isActive = page.id === activePage;
  return `<a class="nav-link${isActive ? ' is-active' : ''}" href="#/${page.id}" data-page="${page.id}"${isActive ? ' aria-current="page"' : ''}>
    ${icon(page.icon)}<span>${page.label}</span>
  </a>`;
}


function sectionHeading(title, detail, link = '') {
  return `<div class="section-heading"><div><h2>${title}</h2><p>${detail}</p></div>${link}</div>`;
}

function statusTag(text, tone = 'neutral') {
  return `<span class="status-tag tone-${tone}"><span class="status-mark" aria-hidden="true"></span>${text}</span>`;
}

function sensorCard({ title, value, unit, iconName, description }) {
  return `<article class="sensor-card">
    <div class="sensor-card-top"><span class="icon-frame">${icon(iconName)}</span></div>
    <p class="sensor-label">${title}</p>
    <div class="sensor-reading"><span>${value}</span>${unit ? `<small>${unit}</small>` : ''}</div>
    <p class="sensor-description">${description}</p>
  </article>`;
}

function moduleRow({ title, detail, iconName, page, status = 'Belum terhubung', tone = 'neutral' }) {
  return `<a class="module-row" href="#/${page}" data-page="${page}">
    <span class="module-icon">${icon(iconName)}</span>
    <span class="module-copy"><strong>${title}</strong><small>${detail}</small></span>
    ${statusTag(status, tone)}${icon('arrow', 'row-arrow')}
  </a>`;
}

const eventTypeLabels = { sensor: 'Sensor', control: 'Kontrol', camera: 'Kamera', egg: 'Berat' };

function renderEventList(events, limit = 4) {
  const preview = new URLSearchParams(window.location.search).get('preview');
  if (preview === 'loading' || preview === 'error') {
    return dataState({ iconName: 'history', title: 'Riwayat aktivitas', detail: 'Informasi aktivitas terbaru.' });
  }
  if (!events.length) {
    return dataState({ iconName: 'history', title: 'Belum ada aktivitas', detail: 'Aktivitas akan muncul setelah data atau tindakan baru tersedia.' });
  }
  return `<div class="event-list">${events.slice(0, limit).map((event) => `<article class="event-row">
    <span class="event-type">${eventTypeLabels[event.type] || 'Event'}</span>
    <div class="event-copy"><strong>${event.title}</strong><p>${event.detail}</p></div>
    <time>${event.time}</time>
  </article>`).join('')}</div>`;
}

function renderTrendChart(title, values, labels, unit, color) {
  const width = 560;
  const height = 150;
  const padX = 16;
  const padY = 16;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = values.map((value, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(values.length - 1, 1);
    const y = height - padY - ((value - minimum) / range) * (height - padY * 2);
    return `${x},${y}`;
  }).join(' ');
  return `<article class="trend-card">
    <div class="trend-card-head"><div><h3>${title}</h3><p>Pembaruan 30 menit terakhir</p></div><span class="trend-unit">${unit}</span></div>
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafik ${title}">
      <line x1="${padX}" y1="42" x2="${width - padX}" y2="42" class="chart-gridline"/>
      <line x1="${padX}" y1="82" x2="${width - padX}" y2="82" class="chart-gridline"/>
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" class="chart-gridline"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${values.map((value, index) => {
        const [x, y] = points.split(' ')[index].split(',');
        return `<circle cx="${x}" cy="${y}" r="4" fill="#fffefa" stroke="${color}" stroke-width="2"><title>${labels[index]}: ${value} ${unit}</title></circle>`;
      }).join('')}
    </svg>
    <div class="trend-axis"><span>${labels[0]}</span><span>${labels[labels.length - 1]}</span></div>
  </article>`;
}

function renderDetectionList() {
  if (!state.detections.length) {
    return dataState({ iconName: 'camera', title: 'Belum ada deteksi', detail: 'Deteksi akan muncul setelah kamera terhubung.' });
  }
  return `<div class="detection-list">${state.detections.map((detection) => `<article class="detection-row">
    <div class="detection-symbol">${icon('camera')}</div>
    <div class="detection-copy"><strong>${detection.className}</strong><span>${detection.time} · keyakinan ${detection.confidence}%</span><small>Status trigger: ${detection.triggerStatus}</small></div>
    <button class="small-action${detection.triggerStatus === 'Berhasil' ? ' is-active' : ''}" type="button" data-action="trigger-esp" data-detection-id="${detection.id}" data-focus-key="trigger-${detection.id}" aria-pressed="${detection.triggerStatus === 'Berhasil'}"${detection.triggerStatus === 'Berhasil' ? ' disabled' : ''}>${detection.triggerStatus === 'Berhasil' ? 'Trigger tercatat' : 'Catat trigger'}</button>
  </article>`).join('')}</div>`;
}

function emptyState({ iconName, title, detail }) {
  return `<div class="empty-state">
    <span class="empty-icon">${icon(iconName)}</span>
    <h3>${title}</h3>
    <p>${detail}</p>
  </div>`;
}

function dataState({ iconName, title, detail }) {
  const preview = new URLSearchParams(window.location.search).get('preview');
  if (preview === 'loading') {
    return `<div class="data-state-preview" role="status"><span class="empty-icon">${icon('clock')}</span><h3>Memuat data</h3><p>Menunggu respons dari sumber data.</p></div>`;
  }
  if (preview === 'error') {
    return `<div class="data-state-preview is-error" role="alert"><span class="empty-icon">${icon('info')}</span><h3>Data belum dapat dimuat</h3><p>Periksa koneksi perangkat, lalu coba lagi.</p><button class="filter-button" type="button" data-action="clear-preview">Tutup</button></div>`;
  }
  return emptyState({ iconName, title, detail });
}

function renderHome() {
  const feedStatus = state.telemetry.feed.available ? 'Tersedia' : 'Habis';
  const waterStatus = state.controls.waterValve ? 'Terbuka' : 'Tertutup';
  const cameraEvents = state.events.filter((event) => event.type === 'camera');

  return `<div class="page-stack">

    <section class="flock-panel">
      <div class="flock-copy">
        <p class="eyebrow">Rencana awal kandang</p>
        <h2>Pemantauan kandang</h2>
        <p>Ringkasan kondisi udara, pakan, air, dan perangkat kandang.</p>
        <a class="text-link" href="#/monitor" data-page="monitor">Lihat data pemantauan ${icon('arrow')}</a>
      </div>
      <div class="flock-count" aria-label="Rencana awal 12 ekor ayam"><strong>${state.flockCount}</strong><span>ekor</span></div>
    </section>

    ${!state.telemetry.feed.available ? `<aside class="demo-alert" role="status"><span class="demo-alert-mark"></span><div><strong>Pakan habis</strong><p>Tempat pakan terdeteksi kosong.</p></div><a href="#/monitor" data-page="monitor">Buka</a></aside>` : ''}

    <div class="home-grid">
      <section class="surface-card environment-panel">
        ${sectionHeading('Udara kandang', `Pembaruan ${state.telemetry.updatedAt}.`, '<a class="quiet-link" href="#/monitor" data-page="monitor">Buka monitoring</a>')}
        <div class="environment-readings">
          <div class="environment-reading">
            <span class="reading-symbol temperature-symbol">${icon('activity')}</span>
            <div><small>Suhu udara</small><strong>${state.telemetry.temperature.value}<span> ${state.telemetry.temperature.unit}</span></strong><p>Pembaruan terbaru</p></div>
          </div>
          <div class="environment-reading">
            <span class="reading-symbol humidity-symbol">${icon('water')}</span>
            <div><small>Kelembapan udara</small><strong>${state.telemetry.humidity.value}<span> ${state.telemetry.humidity.unit}</span></strong><p>Pembaruan terbaru</p></div>
          </div>
        </div>
      </section>

      <section class="surface-card modules-panel">
        ${sectionHeading('Perangkat kandang', 'Kondisi air, pakan, lampu, dan musik.', '<a class="quiet-link" href="#/controls" data-page="controls">Buka kontrol</a>')}
        <div class="module-list">
          ${moduleRow({ title: 'Air minum', detail: `${state.telemetry.water.flowLpm.toFixed(1)} L/menit`, iconName: 'water', page: 'controls', status: waterStatus, tone: 'water' })}
          ${moduleRow({ title: 'Pakan', detail: 'Status tempat pakan', iconName: 'feed', page: 'monitor', status: feedStatus, tone: 'warm' })}
          ${moduleRow({ title: 'Lampu', detail: state.lightColor === 'red' ? 'Pilihan warna merah' : 'Pilihan warna warm white', iconName: 'light', page: 'controls', status: state.controls.lighting ? 'Menyala' : 'Mati', tone: 'warm' })}
          ${moduleRow({ title: 'Musik klasik', detail: 'Status pemutar', iconName: 'music', page: 'controls', status: state.controls.music ? 'Menyala' : 'Mati', tone: 'neutral' })}
        </div>
      </section>
    </div>

    <div class="lower-grid">
      <section class="surface-card camera-summary">
        ${sectionHeading('Kamera dan YOLO', 'Kamera belum terhubung. Riwayat deteksi ada di bawah.')}
        ${renderEventList(cameraEvents, 2)}
        <a class="text-link" href="#/camera" data-page="camera">Buka halaman kamera ${icon('arrow')}</a>
      </section>
      <section class="surface-card activity-summary">
        ${sectionHeading('Aktivitas terbaru', 'Riwayat sensor, kamera, dan kontrol kandang.')}
        ${renderEventList(state.events, 3)}
        <a class="text-link" href="#/history" data-page="history">Buka riwayat ${icon('arrow')}</a>
      </section>
    </div>
  </div>`;
}

function renderMonitor() {
  const cards = [
    { title: 'Suhu udara', value: state.telemetry.temperature.value, unit: state.telemetry.temperature.unit, iconName: 'activity', description: 'Pembaruan suhu kandang.' },
    { title: 'Kelembapan udara', value: state.telemetry.humidity.value, unit: state.telemetry.humidity.unit, iconName: 'water', description: 'Pembaruan kelembapan kandang.' },
    { title: 'Status pakan', value: state.telemetry.feed.available ? 'Tersedia' : 'Habis', unit: '', iconName: 'feed', description: 'Status tempat pakan.' },
    { title: 'Debit air minum', value: state.telemetry.water.flowLpm.toFixed(1), unit: 'L/menit', iconName: 'water', description: `Valve ${state.controls.waterValve ? 'terbuka' : 'tertutup'}.` },
    { title: 'Perubahan berat', value: `+${state.telemetry.weight.delta}`, unit: state.telemetry.weight.unit, iconName: 'weight', description: 'Indikasi perubahan berat.' },
  ];
  return `<div class="page-stack">
    <section class="feed-test-panel surface-card">
      <div><p class="eyebrow">Pemantauan pakan</p><h2>Tempat pakan</h2><p>Ubah status untuk melihat kondisi habis dan tersedia.</p></div>
      <div class="feed-test-action"><button class="action-button action-neutral${state.telemetry.feed.available ? '' : ' is-active'}" type="button" data-action="toggle-feed" data-focus-key="feed-scenario" aria-label="Status tempat pakan" aria-pressed="${!state.telemetry.feed.available}"><span class="button-name">Tempat pakan</span><span class="button-state">${state.telemetry.feed.available ? 'Tersedia' : 'Habis'}</span></button></div>
    </section>
    <div class="sensor-grid">${cards.map(sensorCard).join('')}</div>
    <div class="trend-grid">
      ${renderTrendChart('Suhu udara', state.chartSeries.temperature, state.chartSeries.labels, '°C', '#b97945')}
      ${renderTrendChart('Kelembapan udara', state.chartSeries.humidity, state.chartSeries.labels, '%', '#4b7d83')}
    </div>
  </div>`;
}

function renderControls() {
  return `<div class="page-stack">
    <div class="control-grid">
      <article class="surface-card control-card control-card-water">
        <div class="control-card-head"><span class="control-icon water-icon">${icon('water')}</span></div>
        <p class="eyebrow">Air minum</p>
        <h2>Valve air</h2>
        <p class="control-description">Buka atau tutup aliran air minum. Aturan otomatis belum ditetapkan.</p>
        <div class="control-state-line"><span>Debit air</span><strong>${state.telemetry.water.flowLpm.toFixed(1)} L/menit</strong></div>
        <button class="action-button action-water${state.controls.waterValve ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="waterValve" data-focus-key="waterValve" aria-label="Valve air minum" aria-pressed="${state.controls.waterValve}">
          <span class="button-name">Valve air minum</span><span class="button-state">${state.controls.waterValve ? 'Terbuka' : 'Tertutup'}</span>
        </button>
      </article>

      <article class="surface-card control-card">
        <div class="control-card-head"><span class="control-icon light-icon">${icon('light')}</span></div>
        <p class="eyebrow">Pencahayaan</p>
        <h2>Lampu kandang</h2>
        <p class="control-description">Warna yang dicatat di brief: merah dan warm white.</p>
        <fieldset class="color-choice">
          <legend>Warna lampu</legend>
          <label class="color-option"><input type="radio" name="light-color" value="red" data-action="light-color" data-focus-key="light-color-red" ${state.lightColor === 'red' ? 'checked' : ''}><span class="color-swatch swatch-red"></span><span>Merah</span></label>
          <label class="color-option"><input type="radio" name="light-color" value="warm-white" data-action="light-color" data-focus-key="light-color-warm-white" ${state.lightColor === 'warm-white' ? 'checked' : ''}><span class="color-swatch swatch-warm"></span><span>Warm white</span></label>
        </fieldset>
        <div class="control-state-line"><span>Warna pilihan</span><strong>${state.lightColor === 'red' ? 'Merah' : 'Warm white'}</strong></div>
        <button class="action-button action-neutral${state.controls.lighting ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="lighting" data-focus-key="lighting" aria-label="Lampu kandang" aria-pressed="${state.controls.lighting}">
          <span class="button-name">Lampu kandang</span><span class="button-state">${state.controls.lighting ? 'Menyala' : 'Mati'}</span>
        </button>
      </article>

      <article class="surface-card control-card control-card-music">
        <div class="control-card-head"><span class="control-icon music-icon">${icon('music')}</span></div>
        <p class="eyebrow">Suara kandang</p>
        <h2>Musik klasik</h2>
        <p class="control-description">Jadwal dan pengaturan suara dapat ditentukan setelah spesifikasi perangkat diterima.</p>
        <div class="control-state-line"><span>Mode suara</span><strong>Musik klasik</strong></div>
        <button class="action-button action-neutral${state.controls.music ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="music" data-focus-key="music" aria-label="Musik klasik" aria-pressed="${state.controls.music}">
          <span class="button-name">Musik klasik</span><span class="button-state">${state.controls.music ? 'Menyala' : 'Mati'}</span>
        </button>
      </article>
    </div>
  </div>`;
}

function renderCamera() {
  return `<div class="page-stack">
    <div class="camera-grid">
      <section class="surface-card camera-view-card">
        ${sectionHeading('Tampilan kamera', 'Kamera belum terhubung.')}
        <div class="camera-viewfinder" role="img" aria-label="Placeholder stream kamera">
          <span class="camera-placeholder-icon">${icon('camera')}</span>
          <strong>Live feed belum tersedia</strong>
          <p>Stream kamera akan tampil setelah sumber video dikonfigurasi.</p>
        </div>
      </section>
      <section class="surface-card yolo-card">
        ${sectionHeading('Deteksi YOLO', 'Event deteksi dan status trigger ESP.')}
        <div class="yolo-status-block"><span class="status-mark" aria-hidden="true"></span><div><strong>Model belum tersambung</strong><p>Hasil deteksi dan trigger akan tercatat di sini setelah model terhubung.</p></div></div>
        ${renderEventList(state.events.filter((event) => event.type === 'camera'), 3)}
      </section>
    </div>
    <section class="surface-card detection-section">
      ${sectionHeading('Event deteksi', 'Periksa kelas, tingkat keyakinan, dan status trigger.')}
      <div class="detection-actions"><p>Tambahkan event deteksi untuk menguji daftar dan riwayat.</p><button class="action-button action-neutral" type="button" data-action="add-detection" data-focus-key="add-detection">Tambah deteksi</button></div>
      ${renderDetectionList()}
    </section>
  </div>`;
}

function renderEggs() {
  const eggEvents = filterEvents(state.events, 'egg');
  return `<div class="page-stack">
    <section class="weight-feature surface-card">
      <div class="weight-feature-copy">
        <span class="control-icon weight-icon">${icon('weight')}</span>
        <p class="eyebrow">Sensor berat</p>
        <h2>Indikator kejadian telur</h2>
        <p>Pembacaan berat membantu mencatat perubahan di area bertelur. Lokasi sensor, satuan, dan aturan penentu telur belum dikonfirmasi.</p>
      </div>
      <div class="weight-reading"><span>Pembacaan berat</span><strong>+${state.telemetry.weight.delta} ${state.telemetry.weight.unit}</strong><small>Satuan dan ambang mengikuti konfigurasi</small></div>
    </section>
    <section class="surface-card">
      ${sectionHeading('Catatan telur', 'Indikasi berat tidak otomatis dianggap sebagai telur terkonfirmasi.', '<button class="small-action" type="button" data-action="add-egg-event" data-focus-key="add-egg-event">Tambah indikasi</button>')}
      ${renderEventList(eggEvents, 6)}
    </section>
  </div>`;
}

const historyLabels = {
  all: 'aktivitas',
  sensor: 'pembacaan sensor',
  control: 'kontrol perangkat',
  camera: 'deteksi kamera',
  egg: 'indikasi telur',
};

function renderHistory() {
  const filters = Object.entries(historyLabels).map(([key, label]) => `<button class="filter-button${state.historyFilter === key ? ' is-selected' : ''}" type="button" data-action="history-filter" data-filter="${key}" data-focus-key="history-${key}" aria-pressed="${state.historyFilter === key}">${key === 'all' ? 'Semua' : label}</button>`).join('');
  const events = filterEvents(state.events, state.historyFilter);
  return `<div class="page-stack">
    <section class="surface-card history-card">
      ${sectionHeading('Log kandang', 'Riwayat pembacaan dan aktivitas perangkat.')}
      <div class="filter-row" role="group" aria-label="Filter riwayat">${filters}</div>
      ${renderEventList(events, 20)}
    </section>
  </div>`;
}

const renderers = {
  home: renderHome,
  monitor: renderMonitor,
  controls: renderControls,
  camera: renderCamera,
  eggs: renderEggs,
  history: renderHistory,
};

function renderApp() {
  const pageId = currentPage();
  const page = pages.find((item) => item.id === pageId) || pages[0];
  const nav = pages.map((item) => navLink(item, pageId)).join('');

  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar" id="primary-navigation" aria-label="Navigasi utama">
      <a class="brand" href="#/home" data-page="home" aria-label="Kandang, kembali ke ringkasan">
        <span class="brand-name">Kandang</span>
        <span class="brand-caption">Monitoring ayam</span>
      </a>
      <div class="sidebar-label">Menu</div>
      <nav class="nav-list">${nav}</nav>
      <div class="sidebar-bottom"><span class="sidebar-rule"></span><button class="sidebar-reset" type="button" data-action="reset-demo" data-focus-key="reset-demo">Atur ulang data</button></div>
    </aside>

    <div class="mobile-scrim${app.classList.contains('menu-open') ? ' is-visible' : ''}" data-close-menu aria-hidden="true"></div>
    <div class="main-area">
      <header class="topbar">
        <button class="menu-toggle" type="button" data-menu-toggle aria-controls="primary-navigation" aria-expanded="${app.classList.contains('menu-open')}" aria-label="Buka navigasi">${icon('menu')}</button>
        <div class="page-context"><p>Monitoring kandang</p><h1 id="page-title" tabindex="-1">${page.title}</h1><span>${page.subtitle}</span></div>
        <div class="topbar-meta"><span class="demo-badge" aria-label="Mode demo">DEMO</span><div class="connection-state"><span class="status-mark" aria-hidden="true"></span><span>IoT belum terhubung</span></div></div>
      </header>
      <main class="page-content" id="main-content" tabindex="-1">${renderers[pageId]()}</main>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </div>`;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
  liveAnnouncer.textContent = message;
}

function rerenderAndRestoreFocus(focusKey) {
  const wasMenuOpen = app.classList.contains('menu-open');
  renderApp();
  if (wasMenuOpen) app.classList.remove('menu-open');
  if (focusKey) {
    app.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
  }
}

app.addEventListener('click', (event) => {
  const menuToggle = event.target.closest('[data-menu-toggle]');
  if (menuToggle) {
    app.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(app.classList.contains('menu-open')));
    return;
  }

  if (event.target.closest('[data-close-menu]')) {
    app.classList.remove('menu-open');
    app.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    return;
  }

  const pageLink = event.target.closest('[data-page]');
  if (pageLink) {
    app.classList.remove('menu-open');
    return;
  }

  const controlButton = event.target.closest('[data-action="toggle-control"]');
  if (controlButton) {
    state = toggleControl(state, controlButton.dataset.key);
    rerenderAndRestoreFocus(controlButton.dataset.focusKey);
    showToast('Status perangkat diperbarui.');
    return;
  }

  const feedButton = event.target.closest('[data-action="toggle-feed"]');
  if (feedButton) {
    state = toggleFeedScenario(state);
    rerenderAndRestoreFocus(feedButton.dataset.focusKey);
    showToast('Status pakan diperbarui.');
    return;
  }

  const detectionButton = event.target.closest('[data-action="add-detection"]');
  if (detectionButton) {
    state = addSimulatedDetection(state);
    rerenderAndRestoreFocus(detectionButton.dataset.focusKey);
    showToast('Event deteksi ditambahkan.');
    return;
  }

  const triggerButton = event.target.closest('[data-action="trigger-esp"]');
  if (triggerButton) {
    state = simulateEspTrigger(state, triggerButton.dataset.detectionId);
    rerenderAndRestoreFocus(triggerButton.dataset.focusKey);
    showToast('Trigger tercatat.');
    return;
  }

  const eggButton = event.target.closest('[data-action="add-egg-event"]');
  if (eggButton) {
    state = addSimulatedEggEvent(state);
    rerenderAndRestoreFocus(eggButton.dataset.focusKey);
    showToast('Indikasi berat ditambahkan.');
    return;
  }

  const resetButton = event.target.closest('[data-action="reset-demo"]');
  if (resetButton) {
    state = resetDemo();
    app.classList.remove('menu-open');
    renderApp();
    showToast('Data dikembalikan.');
    return;
  }

  const clearPreview = event.target.closest('[data-action="clear-preview"]');
  if (clearPreview) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
    renderApp();
    return;
  }

  const filterButton = event.target.closest('[data-action="history-filter"]');
  if (filterButton) {
    state = setHistoryFilter(state, filterButton.dataset.filter);
    rerenderAndRestoreFocus(`history-${filterButton.dataset.filter}`);
    return;
  }
});

app.addEventListener('change', (event) => {
  const colorInput = event.target.closest('[data-action="light-color"]');
  if (colorInput) {
    state = setLightColor(state, colorInput.value);
    rerenderAndRestoreFocus(`light-color-${colorInput.value}`);
    showToast('Warna lampu diperbarui.');
  }
});

app.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && app.classList.contains('menu-open')) {
    app.classList.remove('menu-open');
    app.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    app.querySelector('[data-menu-toggle]')?.focus();
  }
});

let skipInitialHashFocus = !window.location.hash;
if (!window.location.hash) window.location.hash = '#/home';

window.addEventListener('hashchange', () => {
  app.classList.remove('menu-open');
  window.scrollTo(0, 0);
  renderApp();
  if (skipInitialHashFocus) {
    skipInitialHashFocus = false;
    return;
  }
  app.querySelector('#page-title')?.focus({ preventScroll: true });
});

renderApp();
