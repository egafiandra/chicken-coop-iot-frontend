export function renderHomeDashboard(model, helpers) {
  const { escapeHTML, icon, sectionHeading, statePill } = helpers;
  const displayName = escapeHTML(model.displayName || 'Pengguna');

  return `<div class="page-stack home-dashboard">
    <section class="coop-hero">
      <div class="coop-hero-art"><img class="coop-hero-photo" src="./src/assets/commons/red-hens-coop.jpg" alt="Ayam Rhode Island Red berkumpul di dalam kandang" width="1937" height="1724" fetchpriority="high"></div>
      <div class="coop-hero-copy"><p class="eyebrow">Selamat datang, ${displayName}</p><h2>Kondisi kandang hari ini</h2><p>Pantau suhu, kelembapan, pakan, dan perangkat.</p><div class="coop-hero-actions"><div class="coop-connection-status">${statePill(model.connectionLabel, 'neutral')}</div><a class="primary-button coop-hero-link" href="#/monitor" data-page="monitor">Monitoring ${icon('arrow')}</a></div></div>
      <div class="coop-flock-count"><span>Jumlah ayam</span><strong>${model.flockCount}</strong><small>ekor</small></div>
    </section>

    <section class="environment-masthead" aria-label="Ringkasan lingkungan kandang">
      <div class="environment-main">
        <div class="environment-temperature"><span class="environment-kicker">${icon('activity')} Suhu kandang</span><div class="environment-reading"><strong>${model.temperatureC}</strong><small>°C</small></div><p>Suhu udara</p></div>
        <div class="environment-divider" aria-hidden="true"></div>
        <div class="environment-humidity"><span class="environment-humidity-icon">${icon('water')}</span><div><small>Kelembapan</small><strong>${model.humidityPercent}%</strong><small>Udara kandang</small></div></div>
      </div>
      <div class="environment-statuses">
        <div class="environment-status"><span class="module-icon">${icon('feed')}</span><div><small>Pakan</small>${statePill(model.feedLabel, model.feedLabel === 'Tersedia' ? 'active' : 'neutral')}</div></div>
        <div class="environment-status"><span class="module-icon">${icon('water')}</span><div><small>Air minum</small>${statePill(model.valveLabel, model.valveLabel === 'Terbuka' ? 'active' : 'neutral')}</div></div>
      </div>
    </section>

    <section class="quick-access-section">${sectionHeading('Akses kandang', 'Pilih menu yang ingin dibuka.')}
      <div class="quick-menu-grid">
        <a class="quick-menu-tile" href="#/monitor" data-page="monitor"><span class="quick-menu-icon">${icon('activity')}</span><span class="quick-menu-copy"><strong>Monitoring</strong><small>Suhu, kelembapan, dan pakan</small></span></a>
        <a class="quick-menu-tile" href="#/controls" data-page="controls"><span class="quick-menu-icon">${icon('sliders')}</span><span class="quick-menu-copy"><strong>Kontrol</strong><small>Valve, lampu, dan musik</small></span></a>
        <a class="quick-menu-tile quick-menu-camera" href="#/camera" data-page="camera"><img class="quick-menu-photo" src="./src/assets/commons/red-hens-coop.jpg" alt="" aria-hidden="true"><span class="quick-menu-copy"><strong>Kamera</strong><small>Kamera belum terhubung</small></span></a>
        <a class="quick-menu-tile" href="#/notifications" data-page="notifications"><span class="quick-menu-icon">${icon('bell')}</span><span class="quick-menu-copy"><strong>Notifikasi</strong><small>${model.unreadNotifications} belum dibaca</small></span></a>
      </div>
    </section>
  </div>`;
}
