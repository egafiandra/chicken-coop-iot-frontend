import {
  createInitialState,
  getHomeDashboardModel,
  loginUser,
  logoutUser,
  markAllNotificationsRead,
  markNotificationRead,
  normalizePage,
  setMusicVolume,
  toggleControl,
  unreadCount,
  updateProfile,
} from './state.mjs?v=user-app-33';
import { getDemoLoginStatus, isValidDemoEmail } from './auth-demo.mjs?v=user-app-33';
import { createAccountSession, navigateToAppRoute, resetDemoAccountSession, startDemoPreview, validateSignupInput } from './auth-flow.mjs?v=user-app-33';
import { loadDemoAccounts, saveDemoAccounts } from './account-storage.mjs?v=user-app-33';
import { renderHomeDashboard } from './home-dashboard.mjs?v=user-app-33';
import { renderMonitorDashboard } from './monitor-dashboard.mjs?v=user-app-33';

const app = document.querySelector('#app');
const liveAnnouncer = document.querySelector('#live-announcer');
const ACCOUNT_STORAGE_KEY = 'kandang-user-accounts-v1';
const persistentAccountStorage = getBrowserStorage('localStorage');
const legacyAccountStorage = getBrowserStorage('sessionStorage');
let state = createInitialState();
let accounts = loadDemoAccounts(persistentAccountStorage, {
  legacyStorage: legacyAccountStorage,
  legacyKey: ACCOUNT_STORAGE_KEY,
});

const pages = [
  { id: 'home', label: 'Beranda', mobileLabel: 'Home', icon: 'home', title: 'Ringkasan kandang', subtitle: 'Kondisi ayam dan perangkat.' },
  { id: 'monitor', label: 'Monitoring', mobileLabel: 'Pantau', icon: 'activity', title: 'Monitoring', subtitle: 'Udara, pakan, air, dan lampu.' },
  { id: 'controls', label: 'Kontrol', mobileLabel: 'Kontrol', icon: 'sliders', title: 'Kontrol kandang', subtitle: 'Valve air, lampu, dan musik.' },
  { id: 'camera', label: 'Kamera', mobileLabel: 'Kamera', icon: 'camera', title: 'Kamera kandang', subtitle: 'Pratinjau area kandang.' },
  { id: 'notifications', label: 'Notifikasi', mobileLabel: 'Notif.', icon: 'bell', title: 'Notifikasi', subtitle: 'Pemberitahuan kandang.' },
  { id: 'profile', label: 'Profil', mobileLabel: 'Profil', icon: 'user', title: 'Profil pengguna', subtitle: 'Informasi akun pengguna.' },
];

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5M9 21v-6h6v6"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  camera: '<path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  water: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  feed: '<path d="M4 10h16l-1.5 9h-13L4 10Z"/><path d="M7 7c1-2 3-2 4 0M13 7c1-2 3-2 4 0M8 14h.01M12 14h.01M16 14h.01"/>',
  light: '<path d="M9 18h6M10 21h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.4-1.5 2.5h-4c-.2-1.1-.6-1.8-1.5-2.5Z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
};

function icon(name, className = '') {
  const paths = iconPaths[name] || iconPaths.info;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function getBrowserStorage(name) {
  try {
    return window[name];
  } catch {
    return null;
  }
}

function saveBrowserAccounts() {
  if (!saveDemoAccounts(accounts, persistentAccountStorage)) {
    showToast('Akun hanya tersedia selama halaman ini terbuka.');
  }
}

function currentPage() {
  return normalizePage(window.location.hash.replace(/^#\/?/, ''));
}

function sectionHeading(title, detail, action = '') {
  return `<div class="section-heading"><div><h2>${title}</h2><p>${detail}</p></div>${action}</div>`;
}

function statePill(label, tone = 'neutral') {
  return `<span class="state-pill tone-${tone}"><span class="state-dot" aria-hidden="true"></span>${label}</span>`;
}

function trendChart(title, values, labels, unit, color) {
  const width = 560;
  const height = 148;
  const padding = 16;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const coordinates = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - ((value - minimum) / range) * (height - padding * 2);
    return [x, y];
  });
  const points = coordinates.map(([x, y]) => `${x},${y}`).join(' ');
  return `<article class="trend-card"><div class="trend-head"><div><h3>${title}</h3><p>30 menit terakhir</p></div><span>${unit}</span></div>
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafik ${title}">
      <line x1="${padding}" y1="40" x2="${width - padding}" y2="40" class="chart-gridline"/><line x1="${padding}" y1="78" x2="${width - padding}" y2="78" class="chart-gridline"/><line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-gridline"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${coordinates.map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="4" fill="#fffefa" stroke="${color}" stroke-width="2"><title>${labels[index]}: ${values[index]} ${unit}</title></circle>`).join('')}
    </svg>
    <div class="trend-axis"><span>${labels[0]}</span><span>${labels[labels.length - 1]}</span></div>
  </article>`;
}

function navLink(page, activePage, mobile = false) {
  const active = page.id === activePage;
  const label = mobile ? page.mobileLabel : page.label;
  return `<a class="nav-link${active ? ' is-active' : ''}" href="#/${page.id}" data-page="${page.id}"${active ? ' aria-current="page"' : ''}>${icon(page.icon)}<span>${label}</span></a>`;
}

function renderHome() {
  return renderHomeDashboard(getHomeDashboardModel(state), {
    escapeHTML,
    icon,
    sectionHeading,
    statePill,
  });
}

function renderMonitor() {
  return renderMonitorDashboard({
    ...getHomeDashboardModel(state),
    temperatureSeries: state.chartSeries.temperature,
    humiditySeries: state.chartSeries.humidity,
    chartLabels: state.chartSeries.labels,
  }, {
    icon,
    sectionHeading,
    statePill,
    trendChart,
  });
}

function renderControls() {
  return `<div class="page-stack"><figure class="controls-scene-strip"><img src="./src/assets/stitch/coop-controls.jpg" alt="Pratinjau kandang ayam dengan tenggeran dan tempat pakan"><figcaption>Area tenggeran dan pakan</figcaption></figure><div class="control-grid">
    <article class="surface-card control-card"><div class="control-card-head"><span class="control-icon water-icon">${icon('water')}</span><span class="control-kicker">Air minum</span></div><h2>Valve air</h2><p class="control-description">Buka atau tutup aliran air minum.</p>
      <div class="control-state-line"><span>Status valve</span><strong>${state.controls.waterValve ? 'Terbuka' : 'Tertutup'}</strong></div>
      <button class="action-button action-water${state.controls.waterValve ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="waterValve" aria-label="Valve air minum" aria-pressed="${state.controls.waterValve}"><span>Valve air minum</span><span class="button-state">${state.controls.waterValve ? 'Terbuka' : 'Tertutup'}</span></button>
    </article>
    <article class="surface-card control-card"><div class="control-card-head"><span class="control-icon light-icon">${icon('light')}</span><span class="control-kicker">Pencahayaan</span></div><h2>Lampu kandang</h2><p class="control-description">Mode cahaya tetap: merah + warm white.</p>
      <div class="control-state-line"><span>Mode cahaya</span><strong>Merah + warm white</strong></div>
      <button class="action-button action-neutral${state.controls.lighting ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="lighting" aria-label="Lampu kandang" aria-pressed="${state.controls.lighting}"><span>Lampu kandang</span><span class="button-state">${state.controls.lighting ? 'Menyala' : 'Mati'}</span></button>
    </article>
    <article class="surface-card control-card music-control-card"><div class="control-card-head"><span class="control-icon music-icon">${icon('music')}</span><span class="control-kicker">Audio</span></div><h2>Musik klasik</h2><p class="control-description">Atur pemutar dan volume musik.</p>
      <div class="control-state-line"><span>Status musik</span><strong>${state.controls.music ? 'Menyala' : 'Mati'}</strong></div>
      <button class="action-button action-neutral${state.controls.music ? ' is-active' : ''}" type="button" data-action="toggle-control" data-key="music" aria-label="Musik klasik" aria-pressed="${state.controls.music}"><span>Musik klasik</span><span class="button-state">${state.controls.music ? 'Menyala' : 'Mati'}</span></button>
      <form class="volume-form" id="volume-form"><label for="music-volume">Volume (%)</label><div class="volume-row"><input id="music-volume" name="volume" type="number" inputmode="numeric" min="0" max="100" step="1" value="${state.musicVolume}" required><button class="small-action" type="submit">Simpan volume</button></div></form>
    </article>
  </div></div>`;
}

function renderCamera() {
  return `<div class="page-stack"><section class="surface-card camera-view-card">${sectionHeading('Kamera kandang', 'Pratinjau area kandang.')}
    <div class="camera-viewfinder camera-viewfinder-photo"><img class="camera-view-image" src="./src/assets/stitch/coop-camera.jpg" alt="Pratinjau kandang ayam dengan area pakan dan minum"><div class="camera-photo-label"><span class="state-dot" aria-hidden="true"></span><strong>Kamera belum terhubung</strong></div></div>
  </section></div>`;
}

function renderNotifications() {
  const unread = unreadCount(state);
  return `<div class="page-stack"><section class="surface-card notifications-card">${sectionHeading('Pemberitahuan kandang', `${unread} belum dibaca.`, unread ? '<button class="small-action" type="button" data-action="mark-all-read">Tandai semua dibaca</button>' : '')}
    <div class="notification-list">${state.notifications.map((item) => `<article class="notification-item${item.read ? ' is-read' : ' is-unread'}"><span class="notification-icon">${icon(item.kind === 'feed' ? 'feed' : item.kind === 'control' ? 'light' : 'activity')}</span><div class="notification-copy"><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.message)}</p><time>${escapeHTML(item.time)}</time></div>${item.read ? statePill('Dibaca') : `<button class="small-action" type="button" data-action="mark-read" data-notification-id="${escapeHTML(item.id)}">Tandai dibaca</button>`}</article>`).join('')}</div>
    ${state.notifications.length ? '' : `<div class="empty-state"><span class="empty-icon">${icon('bell')}</span><h3>Belum ada pemberitahuan</h3><p>Pemberitahuan baru akan muncul di sini.</p></div>`}
  </section></div>`;
}

function renderProfile() {
  const name = escapeHTML(state.profile.name);
  const email = escapeHTML(state.profile.email);
  const phone = escapeHTML(state.profile.phone);
  const displayName = escapeHTML(state.profile.name || 'Pengguna');
  const initial = escapeHTML((state.profile.name || 'P').slice(0, 1).toUpperCase());
  return `<div class="page-stack"><section class="profile-summary surface-card"><span class="profile-avatar" aria-hidden="true">${initial}</span><div><p class="eyebrow">Akun pengguna</p><h2>${displayName}</h2><p>${email || 'Email belum diisi'}</p></div><span class="role-pill">Pengguna</span></section>
    <section class="surface-card profile-form-card">${sectionHeading('Informasi profil', 'Perbarui data akun pengguna.')}
      <form id="profile-form" class="profile-form"><div class="form-field"><label for="profile-name">Nama</label><input id="profile-name" name="name" type="text" maxlength="80" value="${name}" required></div><div class="form-field"><label for="profile-email">Email</label><input id="profile-email" name="email" type="email" value="${email}" required></div><div class="form-field"><label for="profile-phone">Nomor telepon</label><input id="profile-phone" name="phone" type="tel" maxlength="30" value="${phone}"></div><p id="profile-message" class="form-message" role="status" aria-live="polite"></p><div class="form-actions"><button class="primary-button" type="submit">Simpan profil</button><button class="secondary-button" type="button" data-action="logout">Keluar akun</button></div></form>
    </section></div>`;
}

const renderers = {
  home: renderHome,
  monitor: renderMonitor,
  controls: renderControls,
  camera: renderCamera,
  notifications: renderNotifications,
  profile: renderProfile,
};

function renderDemoCryptoNotice() {
  const cryptoAvailable = Boolean(globalThis.crypto?.subtle && globalThis.crypto?.getRandomValues);
  return cryptoAvailable
    ? ''
    : '<p class="login-footnote">Mode demo: kata sandi tidak diverifikasi pada koneksi ini. Untuk autentikasi nyata, gunakan HTTPS dan backend.</p>';
}

function renderLogin() {
  return `<main class="login-screen"><section class="login-brand-panel"><div class="login-brand-top"><a class="brand-name" href="#/login">Smart Poultry</a><span class="demo-badge" aria-label="Mode demo">DEMO</span></div><div class="login-brand-copy"><p class="eyebrow">Monitoring kandang</p><h1>Pantau kandang ayam dari satu layar.</h1><p>Kondisi udara, pakan, air, pencahayaan, dan kamera kandang.</p></div><div class="login-flock"><strong>12</strong><span>ekor, rencana awal</span></div></section>
    <section class="login-form-panel"><div class="login-card"><span class="login-mark">${icon('user')}</span><p class="eyebrow">Akun pengguna</p><h2>Masuk</h2><p class="login-intro">Masukkan email dan kata sandi akun pengguna.</p><form id="login-form" novalidate><div class="form-field"><label for="login-email">Email</label><input id="login-email" name="email" type="email" autocomplete="username" required placeholder="nama@email.com"></div><div class="form-field"><label for="login-password">Kata sandi</label><input id="login-password" name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="Masukkan kata sandi"></div><p id="login-message" class="form-message" role="status" aria-live="polite"></p><button class="primary-button" type="submit">Masuk ke kandang</button></form>${renderDemoCryptoNotice()}<p class="login-footnote">Belum punya akun? <a href="#/signup" data-page="signup">Buat akun</a></p><button class="secondary-button demo-preview-button" type="button" data-action="demo-preview">Masuk sebagai pengguna demo</button></div></section>
  </main><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function renderSignup() {
  return `<main class="login-screen"><section class="login-brand-panel"><div class="login-brand-top"><a class="brand-name" href="#/login">Smart Poultry</a><span class="demo-badge" aria-label="Mode demo">DEMO</span></div><div class="login-brand-copy"><p class="eyebrow">Akun pengguna</p><h1>Buat akun kandang.</h1><p>Daftarkan profil pengguna untuk membuka halaman pemantauan.</p></div><div class="login-flock"><strong>12</strong><span>ekor, rencana awal</span></div></section>
    <section class="login-form-panel"><div class="login-card"><span class="login-mark">${icon('user')}</span><p class="eyebrow">Pendaftaran pengguna</p><h2>Buat akun</h2><p class="login-intro">Lengkapi informasi akun pengguna.</p><form id="signup-form" novalidate>
      <div class="form-field"><label for="signup-name">Nama</label><input id="signup-name" name="name" type="text" maxlength="80" autocomplete="name" required placeholder="Nama pengguna"></div>
      <div class="form-field"><label for="signup-email">Email</label><input id="signup-email" name="email" type="email" autocomplete="email" required placeholder="nama@email.com"></div>
      <div class="form-field"><label for="signup-phone">Nomor telepon</label><input id="signup-phone" name="phone" type="tel" maxlength="30" autocomplete="tel" placeholder="Opsional"></div>
      <div class="form-field"><label for="signup-password">Kata sandi</label><input id="signup-password" name="password" type="password" autocomplete="new-password" minlength="8" required></div>
      <div class="form-field"><label for="signup-confirm">Ulangi kata sandi</label><input id="signup-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></div>
      <p id="signup-message" class="form-message" role="status" aria-live="polite"></p><button id="reset-demo-account" class="secondary-button" type="button" data-action="reset-demo-account" hidden>Ganti akun demo dan masuk</button><button class="primary-button" type="submit">Buat akun pengguna</button>
    </form><p class="login-footnote">Akun demo tersimpan secara lokal di browser ini.</p>${renderDemoCryptoNotice()}<p class="login-footnote">Sudah punya akun? <a href="#/login" data-page="login">Masuk</a></p></div></section>
  </main><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function renderNotificationBell() {
  const count = unreadCount(state);
  return `<a class="notification-shortcut" href="#/notifications" data-page="notifications" aria-label="Notifikasi, ${count} belum dibaca">${icon('bell')}<span class="notification-shortcut-label">Notifikasi</span>${count ? `<span class="notification-count">${count}</span>` : ''}</a>`;
}

function renderNavigation(activePage, mobile = false) {
  return pages.map((page) => {
    const active = page.id === activePage;
    const label = mobile ? page.mobileLabel : page.label;
    return `<a class="nav-link${active ? ' is-active' : ''}" href="#/${page.id}" data-page="${page.id}"${active ? ' aria-current="page"' : ''}>${icon(page.icon)}<span>${label}</span></a>`;
  }).join('');
}

function renderApp() {
  let pageId = currentPage();
  const publicRoute = pageId === 'login' || pageId === 'signup';
  if (!state.isAuthenticated && !publicRoute) {
    window.location.hash = '#/login';
    return;
  }
  if (state.isAuthenticated && publicRoute) {
    window.location.hash = '#/home';
    return;
  }
  if (pageId === 'login') {
    app.innerHTML = renderLogin();
    return;
  }
  if (pageId === 'signup') {
    app.innerHTML = renderSignup();
    return;
  }
  const page = pages.find((item) => item.id === pageId) || pages[0];
  app.innerHTML = `<div class="app-shell"><aside class="sidebar" aria-label="Navigasi pengguna"><a class="brand" href="#/home" data-page="home"><span class="brand-name">Smart Poultry</span><span class="brand-caption">Monitoring ayam</span></a><div class="sidebar-label">Menu pengguna</div><nav class="nav-list">${renderNavigation(pageId)}</nav></aside>
    <div class="main-area"><header class="topbar"><div class="page-context"><p>Monitoring kandang</p><h1 id="page-title" tabindex="-1">${page.title}</h1><span>${page.subtitle}</span></div><div class="topbar-meta"><span class="demo-badge" aria-label="Mode demo">DEMO</span>${pageId === 'home' ? '' : `<div class="connection-state"><span class="status-mark" aria-hidden="true"></span><span>${escapeHTML(getHomeDashboardModel(state).connectionLabel)}</span></div>`}${renderNotificationBell()}<a class="profile-shortcut" href="#/profile" data-page="profile" aria-label="Buka profil">${icon('user')}</a></div></header><main class="page-content" id="main-content" tabindex="-1">${renderers[pageId]()}</main></div>
    <nav class="bottom-nav" aria-label="Navigasi utama">${renderNavigation(pageId, true)}</nav><div class="toast" id="toast" role="status" aria-live="polite"></div></div>`;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  liveAnnouncer.textContent = message;
}

function showFormMessage(id, message) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = message;
}

async function submitLogin(form) {
  const emailInput = form.elements.email;
  const emailValue = String(emailInput?.value ?? '').trim();
  if (!emailValue) {
    showFormMessage('login-message', 'Masukkan alamat email.');
    emailInput?.focus();
    return;
  }
  if (!isValidDemoEmail(emailValue)) {
    showFormMessage('login-message', 'Format email tidak valid. Tanda @ harus berada di antara nama dan domain.');
    emailInput?.focus();
    return;
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const email = emailValue.toLowerCase();
  const password = String(data.get('password') ?? '');
  try {
    const result = await getDemoLoginStatus(accounts, email, password);
    if (result.status === 'not-found') {
      showFormMessage('login-message', `Akun belum terdaftar pada alamat ini (${window.location.origin}). Gunakan alamat/port saat mendaftar, atau daftarkan akun di sini.`);
      return;
    }
    if (result.status === 'wrong-password') {
      showFormMessage('login-message', 'Email ditemukan, tetapi kata sandinya tidak cocok. Untuk akun demo, buka Buat akun dan pilih Ganti akun demo dan masuk.');
      return;
    }
    state = updateProfile(loginUser(state, email), result.account.profile);
    navigateToAppRoute(window.location, renderApp, '#/home');
    if (result.account.credential.mode === 'demo-unverified') {
      showToast('Akun demo aktif; kata sandi tidak diverifikasi pada koneksi ini.');
    }
  } catch {
    showFormMessage('login-message', 'Akun belum dapat dibuka. Periksa kembali email dan kata sandi.');
  }
}

async function submitSignup(form) {
  const resetButton = document.querySelector('#reset-demo-account');
  if (resetButton) resetButton.hidden = true;
  const data = new FormData(form);
  const profile = {
    name: data.get('name'),
    email: String(data.get('email') ?? '').trim().toLowerCase(),
    phone: data.get('phone'),
  };
  const password = String(data.get('password') ?? '');
  const confirmation = String(data.get('confirmPassword') ?? '');
  const validation = validateSignupInput(profile, password, confirmation);
  if (validation) {
    const messages = {
      'name-required': 'Masukkan nama pengguna.',
      'email-invalid': 'Format email tidak valid. Tanda @ harus berada di antara nama dan domain.',
      'password-too-short': 'Kata sandi minimal 8 karakter.',
      'password-mismatch': 'Kata sandi belum sama.',
    };
    const fields = {
      'name-required': form.elements.name,
      'email-invalid': form.elements.email,
      'password-too-short': form.elements.password,
      'password-mismatch': form.elements.confirmPassword,
    };
    showFormMessage('signup-message', messages[validation]);
    fields[validation]?.focus();
    return;
  }
  if (!form.reportValidity()) {
    const invalidField = form.querySelector(':invalid');
    showFormMessage('signup-message', 'Periksa kembali semua kolom yang wajib diisi.');
    invalidField?.focus();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent ?? 'Buat akun pengguna';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Membuat akun…';
  }
  form.setAttribute('aria-busy', 'true');
  showFormMessage('signup-message', 'Membuat akun dan menyiapkan sesi masuk…');
  try {
    const result = await createAccountSession(state, accounts, profile, password, confirmation);
    accounts = result.accounts;
    saveBrowserAccounts();
    state = result.state;
    navigateToAppRoute(window.location, renderApp, result.route);
    if (result.accounts[result.state.profile.email]?.credential.mode === 'demo-unverified') {
      showToast('Akun demo dibuat; kata sandi tidak diverifikasi pada koneksi ini.');
    }
  } catch (error) {
    const duplicate = error.message.includes('already exists');
    if (duplicate && resetButton) resetButton.hidden = false;
    const message = duplicate
      ? 'Email sudah terdaftar dan kata sandinya tidak cocok. Gunakan akun yang ada atau reset akun demo lokal.'
      : error.message.includes('passwords do not match')
        ? 'Kata sandi belum sama.'
        : error.message.includes('8 characters')
          ? 'Kata sandi minimal 8 karakter.'
          : error.message.includes('valid email')
            ? 'Masukkan email yang benar.'
            : error.message.includes('valid name')
              ? 'Masukkan nama pengguna.'
              : 'Akun belum dapat dibuat. Periksa data yang dimasukkan.';
    showFormMessage('signup-message', message);
  } finally {
    form.removeAttribute('aria-busy');
    if (submitButton?.isConnected) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
}

async function resetDemoAccountFromSignup() {
  const form = document.querySelector('#signup-form');
  if (!form || !form.reportValidity()) return;
  const data = new FormData(form);
  const password = String(data.get('password') ?? '');
  const confirmation = String(data.get('confirmPassword') ?? '');
  if (!window.confirm('Ganti akun demo lokal untuk email ini dengan data dan kata sandi baru?')) return;
  try {
    const result = await resetDemoAccountSession(state, accounts, {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
    }, password, confirmation);
    accounts = result.accounts;
    saveBrowserAccounts();
    state = result.state;
    navigateToAppRoute(window.location, renderApp, result.route);
    if (result.accounts[result.state.profile.email]?.credential.mode === 'demo-unverified') {
      showToast('Akun demo direset; kata sandi tidak diverifikasi pada koneksi ini.');
    }
  } catch (error) {
    const message = error.message.includes('passwords do not match')
      ? 'Kata sandi belum sama.'
      : error.message.includes('8 characters')
        ? 'Kata sandi minimal 8 karakter.'
        : 'Akun demo tidak dapat direset. Periksa kembali data yang dimasukkan.';
    showFormMessage('signup-message', message);
  }
}

function submitProfile(form) {
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  try {
    const updated = updateProfile(state, { name: data.get('name'), email: data.get('email'), phone: data.get('phone') });
    const previousEmail = state.profile.email.toLowerCase();
    const nextEmail = updated.profile.email;
    if (accounts[previousEmail]) {
      if (nextEmail !== previousEmail && accounts[nextEmail]) {
        showFormMessage('profile-message', 'Email sudah digunakan akun lain.');
        return;
      }
      const account = accounts[previousEmail];
      if (nextEmail !== previousEmail) delete accounts[previousEmail];
      accounts[nextEmail] = { ...account, profile: updated.profile };
      saveBrowserAccounts();
    }
    state = updated;
    renderApp();
    showToast('Profil disimpan.');
  } catch (error) {
    showFormMessage('profile-message', error.message);
  }
}

app.addEventListener('submit', async (event) => {
  if (event.target.id === 'login-form') {
    event.preventDefault();
    await submitLogin(event.target);
  } else if (event.target.id === 'signup-form') {
    event.preventDefault();
    await submitSignup(event.target);
  } else if (event.target.id === 'profile-form') {
    event.preventDefault();
    submitProfile(event.target);
  } else if (event.target.id === 'volume-form') {
    event.preventDefault();
    const input = event.target.elements.volume;
    if (!input.reportValidity()) return;
    try {
      state = setMusicVolume(state, input.value);
      renderApp();
      showToast('Volume diperbarui.');
    } catch (error) {
      showToast(error.message);
    }
  }
});

app.addEventListener('click', async (event) => {
  if (event.target.closest('[data-page]')) return;
  if (event.target.closest('[data-action="demo-preview"]')) {
    const preview = startDemoPreview(state);
    state = preview.state;
    navigateToAppRoute(window.location, renderApp, preview.route);
    showToast('Pratinjau pengguna demo dibuka.');
    return;
  }
  if (event.target.closest('[data-action="reset-demo-account"]')) {
    await resetDemoAccountFromSignup();
    return;
  }
  const controlButton = event.target.closest('[data-action="toggle-control"]');
  if (controlButton) {
    state = toggleControl(state, controlButton.dataset.key);
    renderApp();
    showToast('Status perangkat diperbarui.');
    return;
  }
  const readButton = event.target.closest('[data-action="mark-read"]');
  if (readButton) {
    state = markNotificationRead(state, readButton.dataset.notificationId);
    renderApp();
    showToast('Notifikasi ditandai dibaca.');
    return;
  }
  if (event.target.closest('[data-action="mark-all-read"]')) {
    state = markAllNotificationsRead(state);
    renderApp();
    showToast('Semua notifikasi ditandai dibaca.');
    return;
  }
  if (event.target.closest('[data-action="logout"]')) {
    state = logoutUser(state);
    window.location.hash = '#/login';
  }
});

window.addEventListener('hashchange', () => {
  window.scrollTo(0, 0);
  renderApp();
  app.querySelector('#page-title')?.focus({ preventScroll: true });
});

if (!window.location.hash) window.location.hash = '#/login';
renderApp();
