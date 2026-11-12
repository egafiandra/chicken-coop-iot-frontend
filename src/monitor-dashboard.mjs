export function renderMonitorDashboard(model, helpers) {
  const { icon, sectionHeading, statePill, trendChart } = helpers;

  return `<div class="page-stack monitor-dashboard">
    <section class="environment-masthead monitor-environment" aria-label="Ringkasan sensor kandang">
      <div class="environment-main">
        <div class="environment-temperature"><span class="environment-kicker">${icon('activity')} Suhu kandang</span><div class="environment-reading"><strong>${model.temperatureC}</strong><small>°C</small></div><p>Udara kandang</p></div>
        <div class="environment-divider" aria-hidden="true"></div>
        <div class="environment-humidity"><span class="environment-humidity-icon">${icon('water')}</span><div><small>Kelembapan</small><strong>${model.humidityPercent}%</strong><small>Udara kandang</small></div></div>
      </div>
      <div class="environment-statuses">
        <div class="environment-status"><span class="module-icon">${icon('feed')}</span><div><small>Pakan</small>${statePill(model.feedLabel, model.feedLabel === 'Tersedia' ? 'active' : 'neutral')}</div></div>
        <div class="environment-status"><span class="module-icon">${icon('water')}</span><div><small>Air minum</small>${statePill(model.valveLabel, model.valveLabel === 'Terbuka' ? 'active' : 'neutral')}</div></div>
      </div>
    </section>

    <section class="monitor-trend-section">${sectionHeading('Tren lingkungan kandang', 'Pembacaan sensor selama 30 menit terakhir.')}
      <div class="trend-grid">${trendChart('Suhu udara', model.temperatureSeries, model.chartLabels, '°C', '#7e5700')}${trendChart('Kelembapan udara', model.humiditySeries, model.chartLabels, '%', '#4b7d83')}</div>
    </section>

    <section class="surface-card monitor-summary">${sectionHeading('Perangkat kandang', 'Status lampu dan musik.')}
      <div class="device-status-list monitor-device-list">
        <div class="device-status-row"><span class="module-icon">${icon('light')}</span><div><strong>Lampu kandang</strong><small>Merah + warm white</small></div>${statePill(model.lightingLabel, model.lightingLabel === 'Menyala' ? 'active' : 'neutral')}</div>
        <div class="device-status-row"><span class="module-icon">${icon('music')}</span><div><strong>Musik klasik</strong><small>Volume ${model.musicVolume}%</small></div>${statePill(model.musicLabel, model.musicLabel === 'Menyala' ? 'active' : 'neutral')}</div>
      </div>
    </section>
  </div>`;
}
