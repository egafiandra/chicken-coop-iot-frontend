import {
  acknowledgeAlert,
  addUser,
  closeModal,
  createAdminState,
  enterAsAdmin,
  exitSession,
  filterUsers,
  normalizeAdminPage,
  openModal,
  resetAdminDemo,
  setCoopFilter,
  setRuleValue,
  setUserRoleFilter,
  setUserSearch,
  summarize,
  toggleCamera,
  toggleDeviceState,
  toggleRule,
  toggleTheme,
  toggleUserActive,
  updateUser,
} from './state.mjs?v=20261125';

const app = document.querySelector('#app');
const liveAnnouncer = document.querySelector('#live-announcer');
let state = createAdminState();
let formError = null;

/* ---------- ikon ---------- */

const P = {
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.6 20a6.4 6.4 0 0 1 12.8 0"/><path d="M16.2 5.3a3.4 3.4 0 0 1 0 6.4M17.8 20a6.4 6.4 0 0 0-1.9-4.6"/>',
  coop: '<path d="m3.2 10.4 8.8-6.9 8.8 6.9"/><path d="M5.4 9.6V20.4h13.2V9.6M9.6 20.4v-5.6h4.8v5.6"/>',
  sliders: '<path d="M4 7h6M14 7h6M4 17h8M16 17h4"/><circle cx="12" cy="7" r="2.2"/><circle cx="14" cy="17" r="2.2"/>',
  camera: '<path d="M4 8h2.6l1.4-2h8l1.4 2H20a1 1 0 0 1 1 1v10H3V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.4" r="3.4"/>',
  logs: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 12.5h6M9 16h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.6 16.6 4 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11.2v5M12 7.9h.01"/>',
  warn: '<path d="M12 3.2 2.8 19.8h18.4L12 3.2Z"/><path d="M12 9.6v4.2M12 17.1h.01"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="2.4"/><path d="M10 3.2v3.6M14 3.2v3.6M10 17.2v3.6M14 17.2v3.6M3.2 10h3.6M3.2 14h3.6M17.2 10h3.6M17.2 14h3.6"/>',
  activity: '<path d="M3 12h3.6l2.6-6.6L13 18.6 15.6 12H21"/>',
  logout: '<path d="M10 20.5H5V3.5h5"/><path d="M15.5 15.8 20 12l-4.5-3.8M20 12H9.4"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  check: '<path d="m5 12.8 4.6 4.6L19 7"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/>',
  moon: '<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.6 8.6 0 1 0 10.4 10.4Z"/>',
  up: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  down: '<path d="M12 5v14M5.5 12.5 12 19l6.5-6.5"/>',
  bell: '<path d="M18 15.6V10a6 6 0 1 0-12 0v5.6L4.4 18h15.2L18 15.6Z"/><path d="M10.4 21h3.2"/>',
  shield: '<path d="M12 2.8 4.6 6v6c0 4.6 3.1 7.8 7.4 9.2 4.3-1.4 7.4-4.6 7.4-9.2V6L12 2.8Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
};

const TYPE_ICON = { esp: 'chip', sensor: 'activity', actuator: 'sliders', camera: 'camera' };

function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
}

/* ---------- halaman ---------- */

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', title: 'Dashboard', lede: 'Ringkasan seluruh kandang, perangkat, dan pengguna dalam satu tampilan.' },
  { id: 'users', label: 'Pengguna', icon: 'users', title: 'Pengguna', lede: 'Kelola akun pengguna dan admin, peran, serta kandang yang mereka pantau.' },
  { id: 'coops', label: 'Kandang', icon: 'coop', title: 'Kandang & perangkat', lede: 'Data induk kandang, node ESP, sensor, dan aktuator yang terdaftar.' },
  { id: 'rules', label: 'Aturan', icon: 'sliders', title: 'Aturan & otomasi', lede: 'Ambang sensor, jadwal aktuator, dan notifikasi yang dibaca panel pengguna.' },
  { id: 'cameras', label: 'Kamera', icon: 'camera', title: 'Kamera & model', lede: 'Sumber stream, ambang keyakinan, dan aksi trigger untuk deteksi YOLO.' },
  { id: 'logs', label: 'Log', icon: 'logs', title: 'Log aktivitas', lede: 'Jejak setiap perubahan konfigurasi yang dilakukan admin.' },
  { id: 'settings', label: 'Pengaturan', icon: 'gear', title: 'Pengaturan', lede: 'Profil admin, mode data, dan status sistem.' },
];

const cur = () => normalizeAdminPage(window.location.hash.replace(/^#\/?/, ''));
const coopName = (id) => state.coops.find((c) => c.id === id)?.name || 'Tanpa kandang';
const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

function head(title, detail, extra = '') {
  return `<div class="card-head"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ''}</div>${extra}</div>`;
}

const link = (text, href, page) => `<a class="card-link" href="${href}" data-page="${page}">${text}${icon('arrow')}</a>`;

const empty = (title, detail, iconName = 'info') =>
  `<div class="empty"><span class="empty-icon">${icon(iconName)}</span><h3>${title}</h3><p>${detail}</p></div>`;

const CHIP = { online: ['ok', 'Online'], offline: ['bad', 'Offline'], warning: ['warn', 'Perlu cek'], aktif: ['ok', 'Aktif'], nonaktif: ['neutral', 'Nonaktif'] };
const chip = (s) => { const [t, l] = CHIP[s] || ['neutral', s]; return `<span class="chip chip--${t}">${l}</span>`; };

/* ---------- sparkline & ring ---------- */

function spark(values, color) {
  const w = 76, h = 26, min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [(i * w) / (values.length - 1), h - 3 - ((v - min) / span) * (h - 8)]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const id = `g${Math.round(min * 89 + max * 7)}${values.length}${color.replace(/\W/g, '')}`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity=".28"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="0,${h} ${line} ${w},${h}" fill="url(#${id})"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function ring(online, warning, offline, size = 96) {
  const total = online + warning + offline || 1;
  const R = size / 2 - 7, C = 2 * Math.PI * R, c = size / 2;
  const seg = [[online, '#7fd6a0'], [warning, '#e9c06a'], [offline, '#e88a72']];
  let off = 0;
  const arcs = seg.filter(([n]) => n > 0).map(([n, col]) => {
    const len = (n / total) * C;
    const el = `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${col}" stroke-width="7"
      stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"
      stroke-linecap="round" transform="rotate(-90 ${c} ${c})"/>`;
    off += len;
    return el;
  }).join('');
  return `<div class="hero-ring-wrap">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="7"/>
      ${arcs}
    </svg>
    <div class="hero-ring-center"><b>${Math.round((online / total) * 100)}%</b><span>sehat</span></div>
  </div>`;
}

/* ---------- gerbang ---------- */

function renderGate() {
  app.innerHTML = `<div class="gate">
    <div class="gate-card">
      <div class="gate-top">
        <span class="brand-mark">${icon('coop')}</span>
        <span><span class="brand-name">Kandang</span><span class="brand-sub">Panel administrasi</span></span>
      </div>
      <h1>Kelola kandang <em>tanpa ribet.</em></h1>
      <p class="gate-lede">Satu tempat untuk mengatur pengguna, memantau perangkat, dan menyetel aturan otomasi yang dibaca panel monitoring.</p>
      <div class="gate-options">
        <button class="gate-option" type="button" data-action="enter-admin">
          <span class="gate-option-top"><span class="gate-option-ico">${icon('shield')}</span><span class="tag tag--admin">Admin</span></span>
          <strong>Masuk sebagai Admin</strong>
          <p>Kelola pengguna, kandang, perangkat, dan aturan otomasi.</p>
          <span class="gate-go">Buka panel ${icon('arrow')}</span>
        </button>
        <a class="gate-option" href="./index.html#/home">
          <span class="gate-option-top"><span class="gate-option-ico">${icon('activity')}</span><span class="tag tag--user">Pengguna</span></span>
          <strong>Buka panel Pengguna</strong>
          <p>Monitoring kandang, kontrol IoT, kamera, dan riwayat.</p>
          <span class="gate-go">Monitoring ${icon('arrow')}</span>
        </a>
      </div>
      <div class="gate-foot">${icon('info')}<span>Mode simulasi. Semua data adalah contoh yang ditandai simulasi — belum ada autentikasi, backend, atau koneksi perangkat nyata.</span></div>
    </div>
  </div>`;
  app.querySelector('[data-action="enter-admin"]')?.focus();
}

/* ---------- dashboard ---------- */

function renderDashboard() {
  const s = summarize(state);
  const open = state.alerts.filter((a) => !a.acknowledged);

  const kpi = [
    { label: 'Total kandang', value: s.totalCoops, note: `${s.activeCoops} aktif · ${s.flockTotal} ekor`, tone: 'var(--pine)', bg: 'var(--pine-tint)', icon: 'coop', series: [3, 3, 2, 3, 3, 3], delta: '+1', dir: 'up' },
    { label: 'Perangkat online', value: `${s.online}<small>/${s.totalDevices}</small>`, note: `${s.warning} perlu dicek · ${s.offline} offline`, tone: 'var(--ok-fg)', bg: 'var(--ok-bg)', icon: 'chip', series: [2, 3, 3, 4, 3, s.online], delta: `${s.offline} mati`, dir: s.offline > 0 ? 'down' : 'flat' },
    { label: 'Pengguna aktif', value: `${s.activeUsers}<small>/${s.totalUsers}</small>`, note: 'Termasuk akun admin', tone: 'var(--sky)', bg: 'var(--sky-tint)', icon: 'users', series: [1, 2, 2, 3, 3, s.activeUsers], delta: `${s.totalUsers - s.activeUsers} nonaktif`, dir: 'flat' },
    { label: 'Alert terbuka', value: s.openAlerts, note: 'Belum ditandai dibaca', tone: 'var(--bad-fg)', bg: 'var(--bad-bg)', icon: 'warn', series: [5, 4, 4, 3, 3, s.openAlerts], delta: 'turun', dir: 'down' },
  ];

  const kpiCards = kpi.map((k) => `<article class="kpi" style="--tone:${k.tone};--tone-bg:${k.bg}">
    <div class="kpi-head">
      <span class="kpi-icon">${icon(k.icon)}</span>
      <span class="kpi-delta${k.dir === 'down' ? ' is-down' : k.dir === 'flat' ? ' is-flat' : ''}">${k.dir === 'up' ? icon('up') : k.dir === 'down' ? icon('down') : ''}${k.delta}</span>
    </div>
    <span class="kpi-label">${k.label}</span>
    <div class="kpi-value">${k.value}</div>
    <div class="kpi-foot"><span class="kpi-note">${k.note}</span>${spark(k.series, k.tone)}</div>
  </article>`).join('');

  const coopCards = state.coops.map((c) => {
    const dev = state.devices.filter((d) => d.coopId === c.id);
    const on = dev.filter((d) => d.status === 'online').length;
    const pct = dev.length ? Math.round((on / dev.length) * 100) : 0;
    return `<article class="coop">
      <div class="coop-top"><div><h3>${c.name}</h3><p>${c.location}</p></div>${chip(c.status)}</div>
      <div class="coop-stats">
        <div class="coop-stat"><b>${c.flockCount}</b><span>ekor</span></div>
        <div class="coop-stat"><b>${on}/${dev.length}</b><span>online</span></div>
        <div class="coop-stat"><b>${state.users.filter((u) => u.coopId === c.id).length}</b><span>user</span></div>
      </div>
      <div class="meter" role="img" aria-label="${pct}% perangkat online"><i style="width:${pct}%"></i></div>
    </article>`;
  }).join('');

  const devRows = state.devices.slice(0, 5).map((d) => `<div class="row">
    <span class="row-icon">${icon(TYPE_ICON[d.type] || 'chip')}</span>
    <span class="row-copy"><strong>${d.name}</strong><small>${coopName(d.coopId)} · ${d.lastHeartbeat}</small></span>
    ${chip(d.status)}
  </div>`).join('');

  const alerts = open.length
    ? `<div class="alert-list">${open.map((a) => `<div class="alert">
        <span class="alert-dot is-${a.level}">${icon(a.level === 'info' ? 'info' : a.level === 'kritis' ? 'warn' : 'bell')}</span>
        <div class="alert-body">
          <strong>${a.title}</strong><p>${a.detail}</p>
          <div class="alert-meta"><span>${a.time}</span><span>·</span><span>${coopName(a.coopId)}</span>
            <button class="btn btn--sm" type="button" data-action="ack-alert" data-alert-id="${a.id}">Tandai dibaca</button>
          </div>
        </div>
      </div>`).join('')}</div>`
    : empty('Tidak ada alert terbuka', 'Semua peringatan sudah ditandai dibaca.', 'check');

  const tl = state.auditLog.slice(0, 5).map((e) => `<div class="tl-row">
    <span class="tl-node"></span>
    <div class="tl-copy"><strong>${e.action}</strong><small>${e.target} · ${e.actor}</small></div>
    <time>${e.time}</time>
  </div>`).join('');

  return `<div class="stack">
    <section class="hero">
      <div>
        <span class="hero-eyebrow">${icon('activity')}Ringkasan operasional</span>
        <h1 id="page-title" tabindex="-1">Semua kandang terkendali.</h1>
        <p class="hero-sub">${s.totalDevices} perangkat terdaftar di ${s.totalCoops} kandang, ${s.activeUsers} pengguna aktif, dan ${s.openAlerts} alert menunggu tindakan.</p>
        <div class="hero-stats">
          <span class="hero-stat"><b>${s.flockTotal}</b> ekor tercatat</span>
          <span class="hero-stat"><b>${s.online}/${s.totalDevices}</b> perangkat online</span>
          <span class="hero-stat"><b>${s.openAlerts}</b> alert terbuka</span>
        </div>
      </div>
      <div class="hero-ring">${ring(s.online, s.warning, s.offline)}</div>
    </section>

    <div class="kpi-grid">${kpiCards}</div>

    <div class="duo">
      <section class="card">
        ${head('Kandang terdaftar', 'Populasi dan kesehatan perangkat tiap kandang.', link('Kelola', '#/coops', 'coops'))}
        <div class="coop-grid">${coopCards}</div>
      </section>
      <section class="card">
        ${head('Kesehatan perangkat', `${s.totalDevices} perangkat terdaftar.`)}
        <div class="legend">
          <div class="legend-row"><i style="background:var(--ok-dot)"></i><span>Online</span><b>${s.online}</b></div>
          <div class="legend-row"><i style="background:var(--warn-dot)"></i><span>Perlu cek</span><b>${s.warning}</b></div>
          <div class="legend-row"><i style="background:var(--bad-dot)"></i><span>Offline</span><b>${s.offline}</b></div>
        </div>
      </section>
    </div>

    <div class="duo-eq">
      <section class="card">
        ${head('Status perangkat', 'Lima perangkat terakhir yang melapor.', link('Lihat semua', '#/coops', 'coops'))}
        <div class="row-list">${devRows}</div>
      </section>
      <section class="card">
        ${head('Alert terbuka', `${open.length} perlu tindakan.`)}
        ${alerts}
      </section>
    </div>

    <section class="card">
      ${head('Aktivitas admin', 'Perubahan konfigurasi terakhir.', link('Buka log', '#/logs', 'logs'))}
      <div class="duo-eq" style="gap:20px">
        <div class="timeline">${tl}</div>
        <div class="audit-summary">
          <div class="audit-stat"><b>${state.auditLog.length}</b><span>total catatan</span></div>
          <div class="audit-stat"><b>${new Set(state.auditLog.map((e) => e.actor)).size}</b><span>aktor berbeda</span></div>
          <div class="audit-stat"><b>${Object.values(state.rules).filter((r) => r.enabled).length}/${Object.keys(state.rules).length}</b><span>aturan aktif</span></div>
        </div>
      </div>
    </section>
  </div>`;
}

/* ---------- pengguna ---------- */

function renderUsers() {
  const users = filterUsers(state);

  const rows = users.length ? users.map((u) => `<tr>
    <td><div class="cell-id"><span class="mini-avatar">${initials(u.name)}</span>
      <span class="cell-id-copy"><span class="cell-strong">${u.name}</span><span class="cell-sub">${u.email}</span></span></div></td>
    <td><span class="tag tag--${u.role === 'admin' ? 'admin' : 'user'}">${u.role}</span></td>
    <td>${u.role === 'admin' ? '<span class="cell-sub">Semua kandang</span>' : coopName(u.coopId)}</td>
    <td>${u.active ? '<span class="chip chip--ok">Aktif</span>' : '<span class="chip chip--neutral">Nonaktif</span>'}</td>
    <td><span class="cell-sub">${u.lastActive}</span></td>
    <td class="is-right"><div class="cell-actions">
      <button class="btn btn--sm" type="button" data-action="edit-user" data-user-id="${u.id}">Ubah</button>
      <button class="btn btn--sm btn--danger" type="button" data-action="toggle-user" data-user-id="${u.id}"${u.id === state.currentUser.id ? ' disabled title="Akun yang sedang dipakai"' : ''}>${u.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
    </div></td>
  </tr>`).join('') : `<tr><td colspan="6">${empty('Pengguna tidak ditemukan', 'Ubah kata kunci atau filter peran.', 'users')}</td></tr>`;

  const seg = [['all', 'Semua'], ['admin', 'Admin'], ['pengguna', 'Pengguna']]
    .map(([k, l]) => `<button type="button" class="${state.ui.userRole === k ? 'is-on' : ''}" data-action="user-role" data-role="${k}" aria-pressed="${state.ui.userRole === k}">${l}</button>`).join('');

  return `<div class="stack">
    <section class="card card--flush">
      <div class="card-pad">${head('Daftar pengguna', `${users.length} dari ${state.users.length} akun ditampilkan.`,
        `<button class="btn btn--primary" type="button" data-action="new-user">${icon('plus')}Tambah pengguna</button>`)}</div>
      <div class="card-pad-x">
        <div class="toolbar">
          <label class="search">${icon('search')}<input type="search" placeholder="Cari nama atau email" value="${state.ui.userSearch}" data-action="user-search" aria-label="Cari pengguna"></label>
          <div class="segmented" role="group" aria-label="Filter peran">${seg}</div>
        </div>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Nama</th><th>Peran</th><th>Kandang</th><th>Status</th><th>Terakhir aktif</th><th class="is-right">Aksi</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  </div>`;
}

function renderUserModal() {
  const m = state.ui.modal;
  const editing = m.mode === 'edit';
  const u = editing ? state.users.find((x) => x.id === m.userId) : null;
  const opts = state.coops.map((c) => `<option value="${c.id}"${u?.coopId === c.id ? ' selected' : ''}>${c.name}</option>`).join('');

  return `<div class="modal-backdrop" data-action="close-modal">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="modal-head">
        <div><h2 id="mt">${editing ? 'Ubah pengguna' : 'Tambah pengguna'}</h2>
          <p>${editing ? 'Perubahan tercatat di log aktivitas.' : 'Akun baru langsung aktif dan tercatat di log aktivitas.'}</p></div>
        <button class="btn btn--icon btn--ghost" type="button" data-action="close-modal" aria-label="Tutup dialog">${icon('x')}</button>
      </div>
      <form data-action="submit-user" data-user-id="${u?.id || ''}" novalidate>
        <div class="form-grid">
          <label class="field field-full"><span class="label">Nama lengkap</span>
            <input type="text" name="name" value="${u?.name || ''}" placeholder="Nama pengguna" required></label>
          <label class="field field-full"><span class="label">Email</span>
            <input type="email" name="email" value="${u?.email || ''}" placeholder="nama@kandang.id" required></label>
          <label class="field"><span class="label">Peran</span>
            <select name="role">
              <option value="pengguna"${u?.role !== 'admin' ? ' selected' : ''}>Pengguna</option>
              <option value="admin"${u?.role === 'admin' ? ' selected' : ''}>Admin</option>
            </select><span class="hint">Admin mengakses seluruh kandang.</span></label>
          <label class="field"><span class="label">Kandang</span>
            <select name="coopId"><option value="">Tanpa kandang</option>${opts}</select>
            <span class="hint">Hanya untuk peran pengguna.</span></label>
        </div>
        ${formError ? `<div class="form-error" role="alert">${icon('warn')}<span>${formError}</span></div>` : ''}
        <div class="modal-actions">
          <button class="btn" type="button" data-action="close-modal">Batal</button>
          <button class="btn btn--primary" type="submit">${editing ? 'Simpan perubahan' : 'Tambah pengguna'}</button>
        </div>
      </form>
    </div>
  </div>`;
}

/* ---------- kandang ---------- */

function renderCoops() {
  const f = state.ui.coopFilter;
  const devs = f === 'all' ? state.devices : state.devices.filter((d) => d.coopId === f);
  const opts = state.coops.map((c) => `<option value="${c.id}"${f === c.id ? ' selected' : ''}>${c.name}</option>`).join('');

  const cards = state.coops.map((c) => {
    const own = state.devices.filter((d) => d.coopId === c.id);
    const on = own.filter((d) => d.status === 'online').length;
    const pct = own.length ? Math.round((on / own.length) * 100) : 0;
    return `<article class="coop">
      <div class="coop-top"><div><h3>${c.name}</h3><p>${c.location}</p></div>${chip(c.status)}</div>
      <div class="coop-stats">
        <div class="coop-stat"><b>${c.flockCount}</b><span>ekor</span></div>
        <div class="coop-stat"><b>${on}/${own.length}</b><span>online</span></div>
        <div class="coop-stat"><b>${state.users.filter((u) => u.coopId === c.id).length}</b><span>user</span></div>
      </div>
      <div class="meter"><i style="width:${pct}%"></i></div>
    </article>`;
  }).join('');

  const rows = devs.length ? devs.map((d) => `<tr>
    <td><div class="cell-id"><span class="row-icon">${icon(TYPE_ICON[d.type] || 'chip')}</span>
      <span class="cell-id-copy"><span class="cell-strong">${d.name}</span><span class="cell-sub">${d.type.toUpperCase()} · ${d.firmware}</span></span></div></td>
    <td>${coopName(d.coopId)}</td>
    <td>${chip(d.status)}</td>
    <td><span class="cell-sub">${d.lastHeartbeat}</span></td>
    <td class="is-right"><button class="btn btn--sm${d.status === 'offline' ? '' : ' btn--danger'}" type="button" data-action="toggle-device" data-device-id="${d.id}">${d.status === 'offline' ? 'Sambungkan' : 'Putuskan'}</button></td>
  </tr>`).join('') : `<tr><td colspan="5">${empty('Belum ada perangkat', 'Perangkat muncul setelah node ESP terhubung.', 'chip')}</td></tr>`;

  return `<div class="stack">
    <section class="card">
      ${head('Kandang', 'Data induk yang dipakai panel pengguna.')}
      <div class="coop-grid">${cards}</div>
    </section>
    <section class="card card--flush">
      <div class="card-pad">${head('Perangkat terdaftar', `${devs.length} perangkat ditampilkan.`)}</div>
      <div class="card-pad-x">
        <div class="toolbar">
          <label class="field field-filter"><span class="label">Filter kandang</span>
            <select class="select" data-action="coop-filter">
              <option value="all"${f === 'all' ? ' selected' : ''}>Semua kandang</option>${opts}
            </select></label>
        </div>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Perangkat</th><th>Kandang</th><th>Status</th><th>Heartbeat</th><th class="is-right">Aksi</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  </div>`;
}

/* ---------- aturan ---------- */

const num = (s, f, label, val, unit, hint = '') => `<label class="field"><span class="label">${label}</span>
  <input type="number" min="0" step="1" value="${val}" data-action="rule-number" data-section="${s}" data-field="${f}" aria-label="${label}">
  <span class="hint">${unit}${hint ? ` · ${hint}` : ''}</span></label>`;

const timeF = (s, f, label, val) => `<label class="field"><span class="label">${label}</span>
  <input type="time" value="${val}" data-action="rule-text" data-section="${s}" data-field="${f}" aria-label="${label}"></label>`;

function ruleCard(id, title, detail, enabled, fields) {
  return `<article class="card rule-card${enabled ? '' : ' is-off'}">
    <div class="rule-head"><div><h3>${title}</h3><p>${detail}</p></div>
      <button class="switch" type="button" data-action="toggle-rule" data-section="${id}" aria-pressed="${enabled}"><i></i>${enabled ? 'Aktif' : 'Nonaktif'}</button>
    </div>
    <div class="rule-fields"${enabled ? '' : ' inert'} aria-hidden="${!enabled}">${fields}</div>
  </article>`;
}

function renderRules() {
  const r = state.rules;
  return `<div class="stack">
    <div class="note">${icon('info')}<span>Nilai di halaman ini adalah konfigurasi yang nantinya dibaca panel pengguna. Masih simulasi — mengubah nilai tidak mengirim perintah ke perangkat.</span></div>
    <div class="rule-grid">
      ${ruleCard('temperature', 'Ambang suhu', 'Penanda suhu di luar batas di panel pengguna.', r.temperature.enabled,
        num('temperature', 'min', 'Minimum', r.temperature.min, '°C') + num('temperature', 'max', 'Maksimum', r.temperature.max, '°C'))}
      ${ruleCard('humidity', 'Ambang kelembapan', 'Batas kelembapan udara kandang.', r.humidity.enabled,
        num('humidity', 'min', 'Minimum', r.humidity.min, '%') + num('humidity', 'max', 'Maksimum', r.humidity.max, '%'))}
      ${ruleCard('feed', 'Notifikasi pakan', 'Peringatan saat tempat pakan kosong.', r.feed.enabled,
        `<label class="field field-full"><span class="label">Perilaku</span>
          <select class="select" data-action="rule-text" data-section="feed" data-field="notifyWhenEmpty">
            <option value="true"${r.feed.notifyWhenEmpty ? ' selected' : ''}>Kirim notifikasi saat kosong</option>
            <option value="false"${!r.feed.notifyWhenEmpty ? ' selected' : ''}>Hanya catat di riwayat</option>
          </select><span class="hint">Panel pengguna menampilkan alert pakan habis.</span></label>`)}
      ${ruleCard('waterValve', 'Otomasi valve air', 'Buka valve bila kelembapan turun di bawah batas.', r.waterValve.enabled,
        num('waterValve', 'openBelow', 'Buka di bawah', r.waterValve.openBelow, '% kelembapan'))}
      ${ruleCard('lighting', 'Jadwal lampu', 'Waktu nyala dan warna lampu kandang.', r.lighting.enabled,
        timeF('lighting', 'onTime', 'Nyala', r.lighting.onTime) + timeF('lighting', 'offTime', 'Padam', r.lighting.offTime) +
        `<label class="field field-full"><span class="label">Warna lampu</span>
          <select class="select" data-action="rule-color" data-section="lighting" data-field="color">
            <option value="warm-white"${r.lighting.color === 'warm-white' ? ' selected' : ''}>Warm white</option>
            <option value="red"${r.lighting.color === 'red' ? ' selected' : ''}>Merah</option>
          </select><span class="hint">Pilihan sama dengan panel pengguna.</span></label>`)}
      ${ruleCard('music', 'Jadwal musik klasik', 'Pemutaran musik pada rentang waktu tertentu.', r.music.enabled,
        timeF('music', 'onTime', 'Mulai', r.music.onTime) + timeF('music', 'offTime', 'Selesai', r.music.offTime))}
      ${ruleCard('egg', 'Ambang indikasi telur', 'Selisih berat minimum agar dicatat sebagai indikasi.', r.egg.enabled,
        num('egg', 'thresholdGram', 'Selisih minimum', r.egg.thresholdGram, 'gram', 'belum konfirmasi telur'))}
    </div>
  </div>`;
}

/* ---------- kamera ---------- */

function renderCameras() {
  const rows = state.cameras.map((c) => `<tr>
    <td><div class="cell-id"><span class="row-icon">${icon('camera')}</span>
      <span class="cell-id-copy"><span class="cell-strong">${c.name}</span><span class="cell-sub">${c.streamUrl}</span></span></div></td>
    <td>${coopName(c.coopId)}</td>
    <td><span class="cell-sub">${c.confidence}%</span></td>
    <td><span class="cell-sub">${c.triggerAction === 'valve' ? 'Buka valve air' : 'Catat ke riwayat'}</span></td>
    <td>${c.active ? '<span class="chip chip--ok">Aktif</span>' : '<span class="chip chip--neutral">Nonaktif</span>'}</td>
    <td class="is-right"><button class="btn btn--sm${c.active ? ' btn--danger' : ''}" type="button" data-action="toggle-camera" data-camera-id="${c.id}">${c.active ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
  </tr>`).join('');

  return `<div class="stack">
    <section class="card card--flush">
      <div class="card-pad">${head('Kamera terdaftar', 'Sumber stream dan aturan deteksi.')}</div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Kamera</th><th>Kandang</th><th>Keyakinan</th><th>Aksi trigger</th><th>Status</th><th class="is-right">Aksi</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
    <section class="card">
      ${head('Belum tersedia', 'Cakupan prototipe front-end.')}
      ${empty('Stream video belum aktif', 'Panel pengguna masih memakai placeholder kamera. Preview stream, unggah model, dan pengujian keyakinan belum diimplementasikan.', 'camera')}
    </section>
  </div>`;
}

/* ---------- log ---------- */

function renderLogs() {
  const tl = state.auditLog.map((e) => `<div class="tl-row">
    <span class="tl-node"></span>
    <div class="tl-copy"><strong>${e.action}</strong><small>${e.target} · ${e.actor}</small></div>
    <time>${e.time}</time>
  </div>`).join('');
  return `<div class="stack">
    <section class="card">
      ${head('Log aktivitas admin', `${state.auditLog.length} catatan, semua ditandai simulasi.`)}
      <div class="timeline">${tl}</div>
    </section>
  </div>`;
}

/* ---------- pengaturan ---------- */

function renderSettings() {
  const s = summarize(state);
  const dark = state.theme === 'midnight';
  return `<div class="stack">
    <div class="duo-eq">
      <section class="card">
        ${head('Profil admin', 'Akun yang dipakai di sesi ini.')}
        <div class="form-grid">
          <label class="field field-full"><span class="label">Nama</span><input type="text" value="${state.currentUser.name}" readonly></label>
          <label class="field field-full"><span class="label">Peran</span><input type="text" value="Admin" readonly></label>
        </div>
      </section>
      <section class="card">
        ${head('Status sistem', 'Mode data dan koneksi perangkat.')}
        <div class="form-grid">
          <label class="field field-full"><span class="label">Mode data</span><input type="text" value="Simulasi — tanpa backend" readonly></label>
          <label class="field field-full"><span class="label">Perangkat online</span><input type="text" value="${s.online} dari ${s.totalDevices}" readonly></label>
        </div>
        <div class="modal-actions modal-actions--start">
          <button class="btn btn--danger" type="button" data-action="reset-admin">Atur ulang data simulasi</button>
        </div>
      </section>
    </div>
    <section class="card">
      ${head('Tampilan', 'Tema panel admin.')}
      <div class="row">
        <span class="row-icon">${icon(dark ? 'moon' : 'sun')}</span>
        <span class="row-copy"><strong>Tema ${dark ? 'midnight' : 'daylight'}</strong><small>Pilihan disimpan selama sesi berlangsung.</small></span>
        <button class="switch" type="button" data-action="toggle-theme" aria-pressed="${dark}"><i></i>${dark ? 'Midnight' : 'Daylight'}</button>
      </div>
    </section>
  </div>`;
}

/* ---------- shell ---------- */

const VIEWS = {
  dashboard: renderDashboard, users: renderUsers, coops: renderCoops,
  rules: renderRules, cameras: renderCameras, logs: renderLogs, settings: renderSettings,
};

function tab(item, active) {
  const on = item.id === active;
  return `<a class="tab${on ? ' is-active' : ''}" href="#/${item.id}" data-page="${item.id}"${on ? ' aria-current="page"' : ''}>
    ${icon(item.icon)}<span>${item.label}</span></a>`;
}

function renderApp() {
  document.documentElement.dataset.theme = state.theme;

  if (!state.session) { renderGate(); return; }

  const id = cur();
  const page = NAV.find((p) => p.id === id) || NAV[0];
  const dark = state.theme === 'midnight';

  app.innerHTML = `<div class="topbar">
    <div class="topbar-inner">
      <button class="ghost-btn hamburger" type="button" data-menu-toggle aria-controls="nav" aria-expanded="${app.classList.contains('nav-open')}" aria-label="Buka navigasi">${icon('menu')}</button>
      <a class="brand" href="#/dashboard" data-page="dashboard" aria-label="Kandang admin, ke dashboard">
        <span class="brand-mark">${icon('coop')}</span>
        <span><span class="brand-name">Kandang</span><span class="brand-sub">Panel admin</span></span>
      </a>
      <nav class="navbar" id="nav" aria-label="Navigasi admin">${NAV.map((i) => tab(i, id)).join('')}</nav>
      <div class="topbar-tools">
        <span class="pill-sim"><i></i>Simulasi</span>
        <button class="ghost-btn" type="button" data-action="toggle-theme" aria-label="Ganti tema" title="Ganti tema">${icon(dark ? 'sun' : 'moon')}</button>
        <span class="me"><span class="avatar">${initials(state.currentUser.name)}</span><span>${state.currentUser.name}</span></span>
        <button class="ghost-btn" type="button" data-action="exit" aria-label="Keluar ke gerbang peran" title="Keluar">${icon('logout')}</button>
      </div>
    </div>
  </div>

  <div class="scrim" data-close-menu aria-hidden="true"></div>

  <main class="canvas" id="main" tabindex="-1">
    ${id === 'dashboard' ? '' : `<div class="card-head" style="margin-bottom:2px">
      <div><h1 id="page-title" tabindex="-1" style="font-size:clamp(21px,2.4vw,27px);font-weight:750;letter-spacing:-.8px">${page.title}</h1>
      <p>${page.lede}</p></div>
    </div>`}
    ${VIEWS[id]()}
  </main>

  ${state.ui.modal ? renderUserModal() : ''}
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

/* ---------- interaksi ---------- */

function toast(msg) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('is-visible'), 2800);
  liveAnnouncer.textContent = msg;
}

function paint() {
  const open = app.classList.contains('nav-open');
  renderApp();
  if (open) app.classList.remove('nav-open');
}

function act(fn, msg) {
  try {
    state = fn();
    formError = null;
    paint();
    if (msg) toast(msg);
    return true;
  } catch (err) {
    formError = err.message;
    paint();
    toast(err.message);
    return false;
  }
}

app.addEventListener('click', (e) => {
  const t = e.target;

  if (t.closest('[data-menu-toggle]')) {
    app.classList.toggle('nav-open');
    app.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', String(app.classList.contains('nav-open')));
    return;
  }
  if (t.closest('[data-close-menu]')) {
    app.classList.remove('nav-open');
    app.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    return;
  }
  if (t.closest('[data-page]')) { app.classList.remove('nav-open'); return; }

  if (t.closest('[data-action="enter-admin"]')) {
    state = enterAsAdmin(state);
    if (!window.location.hash) window.location.hash = '#/dashboard';
    renderApp();
    return;
  }
  if (t.closest('[data-action="exit"]')) {
    state = exitSession(state);
    renderGate();
    return;
  }
  if (t.closest('[data-action="toggle-theme"]')) {
    state = toggleTheme(state);
    paint();
    toast(state.theme === 'midnight' ? 'Tema midnight aktif.' : 'Tema daylight aktif.');
    return;
  }

  if (t.closest('[data-action="new-user"]')) {
    formError = null;
    state = openModal(state, { type: 'user', mode: 'add', userId: null });
    paint();
    app.querySelector('input[name="name"]')?.focus();
    return;
  }
  const edit = t.closest('[data-action="edit-user"]');
  if (edit) {
    formError = null;
    state = openModal(state, { type: 'user', mode: 'edit', userId: edit.dataset.userId });
    paint();
    app.querySelector('input[name="name"]')?.focus();
    return;
  }
  if (t.closest('[data-action="close-modal"]') && (t.classList.contains('modal-backdrop') || t.closest('.modal-actions') || t.closest('.modal-head'))) {
    formError = null;
    state = closeModal(state);
    paint();
    return;
  }

  const tu = t.closest('[data-action="toggle-user"]');
  if (tu) {
    const u = state.users.find((x) => x.id === tu.dataset.userId);
    act(() => toggleUserActive(state, tu.dataset.userId), u?.active ? 'Pengguna dinonaktifkan.' : 'Pengguna diaktifkan.');
    return;
  }

  const rf = t.closest('[data-action="user-role"]');
  if (rf) { act(() => setUserRoleFilter(state, rf.dataset.role)); return; }

  const aa = t.closest('[data-action="ack-alert"]');
  if (aa) { act(() => acknowledgeAlert(state, aa.dataset.alertId), 'Alert ditandai dibaca.'); return; }

  const td = t.closest('[data-action="toggle-device"]');
  if (td) { act(() => toggleDeviceState(state, td.dataset.deviceId), 'Status perangkat diperbarui.'); return; }

  const tc = t.closest('[data-action="toggle-camera"]');
  if (tc) { act(() => toggleCamera(state, tc.dataset.cameraId), 'Status kamera diperbarui.'); return; }

  const tr = t.closest('[data-action="toggle-rule"]');
  if (tr) { act(() => toggleRule(state, tr.dataset.section), 'Status aturan diperbarui.'); return; }

  if (t.closest('[data-action="reset-admin"]')) {
    state = resetAdminDemo(state);
    paint();
    toast('Data simulasi dikembalikan.');
  }
});

app.addEventListener('input', (e) => {
  const s = e.target.closest('[data-action="user-search"]');
  if (!s) return;
  const pos = s.selectionStart;
  state = setUserSearch(state, s.value);
  paint();
  const next = app.querySelector('[data-action="user-search"]');
  next?.focus();
  if (next && pos !== null) next.setSelectionRange(pos, pos);
});

app.addEventListener('change', (e) => {
  const f = e.target.closest('[data-action="coop-filter"]');
  if (f) { act(() => setCoopFilter(state, f.value)); return; }

  const n = e.target.closest('[data-action="rule-number"]');
  if (n) { act(() => setRuleValue(state, n.dataset.section, n.dataset.field, n.value), 'Aturan disimpan.'); return; }

  const c = e.target.closest('[data-action="rule-color"]');
  if (c) { act(() => setRuleValue(state, c.dataset.section, c.dataset.field, c.value), 'Warna lampu disimpan.'); return; }

  const x = e.target.closest('[data-action="rule-text"]');
  if (x) {
    let v = x.value;
    if (x.dataset.field === 'notifyWhenEmpty') v = v === 'true';
    act(() => setRuleValue(state, x.dataset.section, x.dataset.field, v), 'Aturan disimpan.');
  }
});

app.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-action="submit-user"]');
  if (!form) return;
  e.preventDefault();
  const d = new FormData(form);
  const input = { name: d.get('name'), email: d.get('email'), role: d.get('role'), coopId: d.get('coopId') };
  const uid = form.dataset.userId;
  const ok = uid
    ? act(() => updateUser(state, uid, input), 'Pengguna diperbarui.')
    : act(() => addUser(state, input), 'Pengguna ditambahkan.');
  if (!ok) app.querySelector('input[name="name"]')?.focus();
});

app.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (state.ui.modal) {
    formError = null;
    state = closeModal(state);
    paint();
    return;
  }
  if (app.classList.contains('nav-open')) {
    app.classList.remove('nav-open');
    app.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    app.querySelector('[data-menu-toggle]')?.focus();
  }
});

let skipFocus = !window.location.hash;
window.addEventListener('hashchange', () => {
  app.classList.remove('nav-open');
  window.scrollTo(0, 0);
  renderApp();
  if (skipFocus) { skipFocus = false; return; }
  app.querySelector('#page-title')?.focus({ preventScroll: true });
});

renderApp();
