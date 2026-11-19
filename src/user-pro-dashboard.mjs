export function renderUserProDashboard(model, helpers) {
  const { escapeHTML, icon, sectionHeading, statePill } = helpers;
  const notifications = (model.notifications || []).slice(0, 2);
  const metricCard = (label, value, unit, iconName) => `
    <article class="user-pro-metric-card">
      <span class="user-pro-metric-icon">${icon(iconName)}</span>
      <div class="user-pro-metric-copy"><small>${label}</small><strong>${escapeHTML(value)}<span>${unit}</span></strong></div>
    </article>`;

  return `<div class="page-stack user-pro-dashboard">
    <section class="user-pro-summary">
      <div class="user-pro-summary-copy">
        <p class="eyebrow">Ringkasan operasional</p>
        <h2>Dashboard kandang</h2>
        <p>Kondisi kandang dan perangkat yang Anda pantau.</p>
      </div>
      <div class="user-pro-connection">${statePill(escapeHTML(model.connectionLabel), 'neutral')}</div>
    </section>

    <section class="user-pro-metric-grid" aria-label="Metrik kandang">
      ${metricCard('Jumlah ayam', model.flockCount, 'ekor', 'home')}
      ${metricCard('Suhu kandang', model.temperatureC, '°C', 'activity')}
      ${metricCard('Kelembapan', model.humidityPercent, '%', 'water')}
      ${metricCard('Notifikasi', model.unreadNotifications, 'belum dibaca', 'bell')}
    </section>

    <div class="user-pro-lower-grid">
      <section class="surface-card user-pro-devices">${sectionHeading('Kondisi perangkat', 'Status perangkat di kandang Anda.')}
        <div class="user-pro-status-list">
          <article class="user-pro-status-row"><span class="module-icon">${icon('feed')}</span><div><strong>Pakan</strong><small>Ketersediaan pakan</small></div>${statePill(escapeHTML(model.feedLabel), model.feedLabel === 'Tersedia' ? 'active' : 'neutral')}</article>
          <article class="user-pro-status-row"><span class="module-icon">${icon('water')}</span><div><strong>Air minum</strong><small>Valve air minum</small></div>${statePill(escapeHTML(model.valveLabel), model.valveLabel === 'Terbuka' ? 'active' : 'neutral')}</article>
          <article class="user-pro-status-row"><span class="module-icon">${icon('light')}</span><div><strong>Lampu kandang</strong><small>Merah + warm white</small></div>${statePill(escapeHTML(model.lightingLabel), model.lightingLabel === 'Menyala' ? 'active' : 'neutral')}</article>
          <article class="user-pro-status-row"><span class="module-icon">${icon('music')}</span><div><strong>Musik klasik</strong><small>Volume ${escapeHTML(model.musicVolume)}%</small></div>${statePill(escapeHTML(model.musicLabel), model.musicLabel === 'Menyala' ? 'active' : 'neutral')}</article>
        </div>
      </section>

      <section class="surface-card user-pro-notifications">${sectionHeading('Notifikasi terbaru', `${model.unreadNotifications} belum dibaca.`)}
        ${notifications.length ? `<div class="user-pro-notification-list">${notifications.map((item) => `<article class="user-pro-notification"><span class="notification-icon">${icon(item.kind === 'feed' ? 'feed' : 'activity')}</span><div><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.message)}</p><time>${escapeHTML(item.time)}</time></div></article>`).join('')}</div>` : '<p class="user-pro-empty">Belum ada notifikasi.</p>'}
      </section>
    </div>

    <section class="user-pro-shortcuts" aria-label="Akses fitur pengguna">
      <a class="quick-menu-tile" href="#/controls" data-page="controls"><span class="quick-menu-icon">${icon('sliders')}</span><span class="quick-menu-copy"><strong>Kontrol</strong><small>Atur valve, lampu, dan musik</small></span></a>
      <a class="quick-menu-tile" href="#/camera" data-page="camera"><span class="quick-menu-icon">${icon('camera')}</span><span class="quick-menu-copy"><strong>Kamera</strong><small>Kamera belum terhubung</small></span></a>
      <a class="quick-menu-tile" href="#/notifications" data-page="notifications"><span class="quick-menu-icon">${icon('bell')}</span><span class="quick-menu-copy"><strong>Notifikasi</strong><small>${model.unreadNotifications} belum dibaca</small></span></a>
    </section>
  </div>`;
}
