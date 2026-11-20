export function renderUserProDashboard(model, helpers) {
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
  const deviceRow = (iconName, label, detail, value, tone = 'neutral') => `<div class="row">
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

    <section class="kpi-grid user-pro-metric-grid" aria-label="Metrik kandang">${metrics.map(metricCard).join('')}</section>

    <div class="duo-eq user-pro-panels">
      <section class="card user-pro-devices">
        <div class="card-head"><div><h2>Kondisi perangkat</h2><p>Status perangkat di kandang Anda.</p></div></div>
        <div class="row-list">
          ${deviceRow('feed', 'Pakan', 'Ketersediaan pakan', model.feedLabel, model.feedLabel === 'Tersedia' ? 'ok' : 'warn')}
          ${deviceRow('water', 'Air minum', 'Valve air minum', model.valveLabel)}
          ${deviceRow('light', 'Lampu kandang', 'Merah + warm white', model.lightingLabel, model.lightingLabel === 'Menyala' ? 'ok' : 'neutral')}
          ${deviceRow('music', 'Musik klasik', `Volume ${model.musicVolume}%`, model.musicLabel, model.musicLabel === 'Menyala' ? 'ok' : 'neutral')}
        </div>
      </section>

      <section class="card user-pro-notifications">
        <div class="card-head"><div><h2>Notifikasi terbaru</h2><p>${escapeHTML(model.unreadNotifications)} belum dibaca.</p></div><a class="card-link" href="#/notifications" data-page="notifications">Lihat semua ${icon('arrow')}</a></div>
        ${notifications.length ? `<div class="row-list">${notifications.map((item) => `<article class="row user-pro-notification"><span class="row-icon">${icon(item.kind === 'feed' ? 'feed' : 'activity')}</span><span class="row-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.message)}</small></span><time>${escapeHTML(item.time)}</time></article>`).join('')}</div>` : '<p class="user-pro-empty">Belum ada notifikasi.</p>'}
      </section>
    </div>
  </div>`;
}
