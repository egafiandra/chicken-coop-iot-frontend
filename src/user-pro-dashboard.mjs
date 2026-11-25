const PRO_COOP_PERIODS = new Set(['siang', 'sore', 'malam']);

function renderProCoopControls(sceneControls, escapeHTML) {
  const controls = sceneControls.controls || {};
  const lightingOn = controls.lighting === true;
  const musicOn = controls.music === true;
  const valveOn = controls.waterValve === true;
  const periodPreference = ['auto', 'siang', 'sore', 'malam'].includes(sceneControls.periodPreference)
    ? sceneControls.periodPreference
    : 'auto';
  const periodLabel = escapeHTML(sceneControls.periodLabel || '');
  const clock = escapeHTML(sceneControls.clock || '');
  const datetime = escapeHTML(sceneControls.datetime || '');
  const datetimeAttribute = datetime ? ` datetime="${datetime}"` : '';
  const activityLabel = escapeHTML(sceneControls.activityLabel || '');
  const gentleMotion = sceneControls.motionPreference === 'gentle';
  const controlRow = (key, label, detail, active) => `<div class="coop-control-row"><div class="coop-control-copy"><strong>${label}</strong><small>${detail}</small></div><button class="coop-switch" type="button" data-action="toggle-control" data-key="${key}" aria-label="${label}" aria-pressed="${active}"><span class="coop-switch-track" aria-hidden="true"><span class="coop-switch-thumb"></span></span><span class="sr-only">${active ? 'Menyala' : 'Mati'}</span></button></div>`;
  const periodButtons = [['auto', 'Otomatis'], ['siang', 'Siang'], ['sore', 'Sore'], ['malam', 'Malam']]
    .map(([value, label]) => `<button class="coop-period-button" type="button" data-action="set-coop-period" data-period="${value}" aria-pressed="${periodPreference === value}">${label}</button>`)
    .join('');
  const statusRow = (key, label, active) => `<li class="coop-device-status-row" data-pro-status-key="${key}"><span class="coop-device-dot${active ? ' is-on' : ''}" aria-hidden="true"></span><span>${label}</span><strong>${active ? 'ON' : 'OFF'}</strong></li>`;

  return `<section class="coop-control-suite user-pro-coop-suite" aria-label="Kontrol dan tampilan simulasi kandang">
    <article class="coop-control-panel coop-device-controls"><h3>Kontrol IoT</h3><p class="coop-panel-note">Pratinjau demo, tidak mengirim perintah.</p><div class="coop-control-list">
      ${controlRow('lighting', 'Lampu', 'Merah + warm white', lightingOn)}
      ${controlRow('music', 'Musik', 'Gerak visual mengikuti irama', musicOn)}
      ${controlRow('waterValve', 'Valve air', 'Simulasi suplai air', valveOn)}
    </div></article>
    <article class="coop-control-panel coop-time-controls"><h3>Mode waktu</h3><div class="coop-period-grid" role="group" aria-label="Pilih mode waktu visual">${periodButtons}</div>
      <p class="coop-mode-readout"><time id="pro-coop-clock"${datetimeAttribute}>${clock}</time><span aria-hidden="true"> · </span><span id="pro-coop-period">${periodLabel}</span></p>
      <p class="coop-mode-activity" id="pro-coop-activity">${activityLabel}</p>
      <p class="coop-mode-note">Mode waktu hanya mengubah visual 3D. Malam mengutamakan istirahat meski musik aktif; otomatis mengikuti preferensi gerakan sistem.</p>
      <label class="coop-motion-option"><input id="pro-coop-motion-gentle" type="checkbox" data-action="toggle-coop-motion"${gentleMotion ? ' checked' : ''}><span>Gerakan lembut</span></label>
      <p class="coop-animation-status" id="pro-coop-animation-status" role="status" aria-live="polite">Menyiapkan visualisasi 3D.</p>
    </article>
    <article class="coop-control-panel coop-device-status"><h3>Status perangkat</h3><ul class="coop-device-status-list">
      ${statusRow('lighting', 'Lampu', lightingOn)}${statusRow('music', 'Musik', musicOn)}${statusRow('waterValve', 'Valve', valveOn)}
    </ul><p class="coop-status-note">Nilai sensor dan status hanya contoh. Tidak terhubung ke ESP atau perangkat nyata.</p></article>
  </section>`;
}

function renderProCoopStage() {
  return `<section class="card user-pro-coop-stage" aria-label="Visualisasi konseptual kandang">
    <div class="card-head"><div><h2>Simulasi kandang 3D</h2><p>Model konseptual, bukan kamera langsung. Kontrol di bawah hanya simulasi lokal.</p></div></div>
    <div class="user-pro-coop-art"><img class="user-pro-coop-photo" src="./src/assets/commons/red-hens-coop.jpg" alt="Foto kandang sebagai fallback untuk visualisasi 3D" width="1937" height="1724">
      <div id="pro-coop-3d" class="coop-3d user-pro-coop-3d" data-coop-status="loading" aria-hidden="true" role="group" aria-label="Visualisasi konseptual kandang tiga tingkat, bukan kamera langsung"><span class="user-pro-coop-label" aria-hidden="true">Model konseptual, bukan kamera</span></div>
    </div>
  </section>`;
}

export function renderUserProDashboard(model, helpers, sceneControls = {}) {
  const { escapeHTML, icon } = helpers;
  const notifications = (model.notifications || []).slice(0, 2);
  const statusChip = (label, tone = 'neutral') => `<span class="chip chip--${tone}">${escapeHTML(label)}</span>`;
  const metricCard = ({ label, value, unit, note, iconName, tone, tint }, index) => `
    <article class="kpi user-pro-kpi rise" style="--i:${index + 1};--tone:${tone};--tone-bg:${tint}">
      <div class="kpi-head"><span class="kpi-icon">${icon(iconName)}</span></div>
      <span class="kpi-label">${label}</span>
      <div class="kpi-value">${escapeHTML(value)}<small>${unit}</small></div>
      <div class="kpi-foot"><span class="kpi-note">${note}</span></div>
    </article>`;
  const metrics = [
    { label: 'Jumlah ayam', value: model.flockCount, unit: 'ekor', note: 'Rencana awal', iconName: 'home', tone: 'var(--violet)', tint: 'var(--violet-tint)' },
    { label: 'Suhu kandang', value: model.temperatureC, unit: '°C', note: 'Udara kandang', iconName: 'activity', tone: 'var(--amber)', tint: 'var(--amber-tint)' },
    { label: 'Kelembapan', value: model.humidityPercent, unit: '%', note: 'Udara kandang', iconName: 'water', tone: 'var(--cyan)', tint: 'var(--cyan-tint)' },
    { label: 'Notifikasi', value: model.unreadNotifications, unit: 'belum dibaca', note: 'Perlu ditinjau', iconName: 'bell', tone: 'var(--rose)', tint: 'var(--rose-tint)' },
  ];
  const deviceRow = (iconName, label, detail, value, tone = 'neutral', deviceKey = '') => `<div class="row"${deviceKey ? ` data-pro-device-key="${deviceKey}"` : ''}>
    <span class="row-icon">${icon(iconName)}</span><span class="row-copy"><strong>${label}</strong><small>${detail}</small></span>${statusChip(value, tone)}
  </div>`;

  return `<div class="stack user-pro-dashboard">
    <section class="hero user-pro-hero rise" style="--i:0">
      <div>
        <span class="hero-eyebrow">${icon('activity')}Ringkasan operasional</span>
        <h1 id="page-title" tabindex="-1">Dashboard kandang</h1>
        <p class="hero-sub">Kondisi kandang dan perangkat yang Anda pantau.</p>
        <div class="hero-stats">
          <span class="hero-stat"><b>${escapeHTML(model.flockCount)}</b> ekor</span>
          <span class="hero-stat"><b>${escapeHTML(model.temperatureC)}°C</b> suhu kandang</span>
          <span class="hero-stat"><b>${escapeHTML(model.humidityPercent)}%</b> kelembapan</span>
        </div>
      </div>
      <aside class="hero-ring user-pro-connection" aria-label="Status koneksi: ${escapeHTML(model.connectionLabel)}">
        <div class="user-pro-connection-ring"><span class="state-dot" aria-hidden="true"></span><b>DEMO</b></div>
        <span class="user-pro-connection-label">${escapeHTML(model.connectionLabel)}</span>
      </aside>
    </section>

    ${renderProCoopStage()}
    ${renderProCoopControls(sceneControls, escapeHTML)}

    <section class="kpi-grid user-pro-metric-grid" aria-label="Metrik kandang">${metrics.map(metricCard).join('')}</section>

    <div class="duo-eq user-pro-panels">
      <section class="card user-pro-devices">
        <div class="card-head"><div><h2>Kondisi perangkat</h2><p>Status perangkat di kandang Anda.</p></div></div>
        <div class="row-list">
          ${deviceRow('feed', 'Pakan', 'Ketersediaan pakan', model.feedLabel, model.feedLabel === 'Tersedia' ? 'ok' : 'warn')}
          ${deviceRow('water', 'Air minum', 'Valve air minum', model.valveLabel, 'neutral', 'waterValve')}
          ${deviceRow('light', 'Lampu kandang', 'Merah + warm white', model.lightingLabel, model.lightingLabel === 'Menyala' ? 'ok' : 'neutral', 'lighting')}
          ${deviceRow('music', 'Musik klasik', `Volume ${model.musicVolume}%`, model.musicLabel, model.musicLabel === 'Menyala' ? 'ok' : 'neutral', 'music')}
        </div>
      </section>

      <section class="card user-pro-notifications">
        <div class="card-head"><div><h2>Notifikasi terbaru</h2><p>${escapeHTML(model.unreadNotifications)} belum dibaca.</p></div><a class="card-link" href="#/notifications" data-page="notifications">Lihat semua ${icon('arrow')}</a></div>
        ${notifications.length ? `<div class="row-list">${notifications.map((item) => `<article class="row user-pro-notification"><span class="row-icon">${icon(item.kind === 'feed' ? 'feed' : 'activity')}</span><span class="row-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.message)}</small></span><time>${escapeHTML(item.time)}</time></article>`).join('')}</div>` : '<p class="user-pro-empty">Belum ada notifikasi.</p>'}
      </section>
    </div>
  </div>`;
}

export function updateProCoopDashboard(root, sceneControls = {}) {
  if (!root?.querySelector || !root?.querySelectorAll) return false;
  const controls = sceneControls.controls || {};
  const switchLabel = (enabled) => enabled ? 'Menyala' : 'Mati';

  root.querySelectorAll('.user-pro-coop-suite .coop-switch').forEach((button) => {
    const enabled = controls[button.dataset.key] === true;
    button.setAttribute('aria-pressed', String(enabled));
    const stateLabel = button.querySelector('.sr-only');
    if (stateLabel) stateLabel.textContent = switchLabel(enabled);
  });

  root.querySelectorAll('.user-pro-coop-suite .coop-device-status-row').forEach((row) => {
    const enabled = controls[row.dataset.proStatusKey] === true;
    row.querySelector('.coop-device-dot')?.classList.toggle('is-on', enabled);
    const status = row.querySelector('strong');
    if (status) status.textContent = enabled ? 'ON' : 'OFF';
  });

  root.querySelectorAll('.user-pro-devices [data-pro-device-key]').forEach((row) => {
    const key = row.dataset.proDeviceKey;
    const enabled = controls[key] === true;
    const status = row.querySelector('.chip');
    if (!status) return;
    status.textContent = key === 'waterValve'
      ? enabled ? 'Terbuka' : 'Tertutup'
      : switchLabel(enabled);
    status.className = `chip chip--${key === 'waterValve' || !enabled ? 'neutral' : 'ok'}`;
  });

  const periodPreference = ['auto', 'siang', 'sore', 'malam'].includes(sceneControls.periodPreference)
    ? sceneControls.periodPreference
    : 'auto';
  root.querySelectorAll('.user-pro-coop-suite .coop-period-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.period === periodPreference));
  });

  const clock = root.querySelector('#pro-coop-clock');
  if (clock) {
    clock.textContent = sceneControls.clock || '';
    if (sceneControls.datetime) clock.dateTime = sceneControls.datetime;
  }
  const period = root.querySelector('#pro-coop-period');
  if (period) period.textContent = sceneControls.periodLabel || '';
  const activity = root.querySelector('#pro-coop-activity');
  if (activity) activity.textContent = sceneControls.activityLabel || '';
  const gentleMotion = root.querySelector('#pro-coop-motion-gentle');
  if (gentleMotion) gentleMotion.checked = sceneControls.motionPreference === 'gentle';
  return true;
}

export function getProCoop3DState(appState, period, motionPreference = 'auto') {
  return {
    lamp: appState?.controls?.lighting === true,
    music: appState?.controls?.music === true,
    valve: appState?.controls?.waterValve === true,
    period: PRO_COOP_PERIODS.has(period) ? period : 'siang',
    motion: ['auto', 'full', 'gentle'].includes(motionPreference) ? motionPreference : 'auto',
  };
}

function setProCoop3DStatus(root, status) {
  if (!root?.dataset) return;
  root.dataset.coopStatus = status;
  root.setAttribute?.('aria-hidden', String(status !== 'ready'));
  const fallback = root.parentElement?.querySelector('.user-pro-coop-photo');
  if (fallback) {
    if (status === 'ready') fallback.setAttribute('aria-hidden', 'true');
    else fallback.removeAttribute('aria-hidden');
  }
  const statusText = root.closest?.('.user-pro-dashboard')?.querySelector('#pro-coop-animation-status');
  const messages = {
    loading: 'Memuat tampilan 3D.',
    ready: 'Animasi 3D berjalan. Status perangkat hanya simulasi.',
    fallback: 'Foto kandang ditampilkan, tampilan 3D tidak tersedia.',
    disposed: 'Tampilan 3D ditutup.',
  };
  if (statusText) statusText.textContent = messages[status] || messages.fallback;
}

export function mountProCoop3D(root, appState, options = {}) {
  if (!root?.dataset) return () => {};
  const {
    period,
    periodPreference = 'auto',
    motion = 'auto',
    loadScene = () => import('./assets/coop/coop-3d.mjs?v=user-app-72'),
  } = options;
  let currentAppState = appState;
  let currentPeriod = period;
  let currentMotion = motion;
  let periodMode = ['auto', 'siang', 'sore', 'malam'].includes(periodPreference) ? periodPreference : 'auto';
  let cancelled = false;
  let coop = null;
  let sceneModule = null;
  let unbindPeriod = () => {};
  setProCoop3DStatus(root, 'loading');

  void Promise.resolve()
    .then(loadScene)
    .then((loadedModule) => {
      if (cancelled || root.isConnected === false) return;
      sceneModule = loadedModule;
      coop = sceneModule.mountCoop3D(root, getProCoop3DState(currentAppState, currentPeriod, currentMotion));
      if (cancelled) {
        coop.dispose();
        coop = null;
        return;
      }
      if (periodMode === 'auto') unbindPeriod = sceneModule.bindRepoPeriod(coop);
    })
    .catch(() => {
      if (cancelled) return;
      unbindPeriod();
      unbindPeriod = () => {};
      coop?.dispose();
      coop = null;
      sceneModule = null;
      setProCoop3DStatus(root, 'fallback');
    });

  const cleanup = () => {
    if (cancelled) return;
    cancelled = true;
    unbindPeriod();
    unbindPeriod = () => {};
    coop?.dispose();
    coop = null;
    setProCoop3DStatus(root, 'disposed');
  };

  cleanup.update = (nextAppState, nextOptions = {}) => {
    if (cancelled) return;
    if (nextAppState) currentAppState = nextAppState;
    if (Object.hasOwn(nextOptions, 'period')) currentPeriod = nextOptions.period;
    if (Object.hasOwn(nextOptions, 'motion')) currentMotion = nextOptions.motion;
    const nextPeriodMode = ['auto', 'siang', 'sore', 'malam'].includes(nextOptions.periodPreference)
      ? nextOptions.periodPreference
      : periodMode;
    if (nextPeriodMode !== periodMode) {
      unbindPeriod();
      unbindPeriod = () => {};
      periodMode = nextPeriodMode;
      if (periodMode === 'auto' && coop && sceneModule) unbindPeriod = sceneModule.bindRepoPeriod(coop);
    }
    coop?.setState(getProCoop3DState(currentAppState, currentPeriod, currentMotion));
  };

  return cleanup;
}
