export function renderEditionSettings(activeEdition) {
  const selected = activeEdition === 'pro' ? 'pro' : 'lite';
  return `<section class="surface-card edition-settings-card">
    <div class="section-heading"><div><p class="eyebrow">Mode aplikasi</p><h2>Pilih versi aplikasi</h2><p>Lite untuk pemantauan sederhana. Pro menyajikan ringkasan kandang dan status perangkat dalam satu dashboard.</p></div></div>
    <div class="edition-switch" role="group" aria-label="Pilih versi aplikasi">
      <button class="edition-option${selected === 'lite' ? ' is-selected' : ''}" type="button" data-action="select-edition" data-edition="lite" aria-pressed="${selected === 'lite'}">Lite</button>
      <button class="edition-option${selected === 'pro' ? ' is-selected' : ''}" type="button" data-action="select-edition" data-edition="pro" aria-pressed="${selected === 'pro'}">Pro</button>
    </div>
  </section>`;
}

export function renderSettingsShortcut(icon) {
  return `<a class="settings-shortcut" href="#/settings" data-page="settings" aria-label="Pengaturan" title="Pengaturan">${icon('settings')}<span class="settings-shortcut-label">Pengaturan</span></a>`;
}

export function renderProProfileShortcut(name, initials, active = false) {
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  return `<a class="rail-user${active ? ' is-active' : ''}" href="#/settings" data-page="settings" aria-label="Buka Pengaturan profil pengguna"${active ? ' aria-current="page"' : ''}><span class="avatar">${escape(initials)}</span><span class="rail-user-copy"><strong>${escape(name)}</strong><small>Pengguna</small></span></a>`;
}