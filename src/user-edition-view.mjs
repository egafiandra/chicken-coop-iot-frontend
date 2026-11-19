export function renderEditionSettings(activeEdition) {
  const selected = activeEdition === 'pro' ? 'pro' : 'lite';
  return `<section class="surface-card edition-settings-card">
    <div class="section-heading"><div><p class="eyebrow">Mode aplikasi</p><h2>Pilih versi aplikasi</h2><p>Lite untuk pemantauan kandang. Pro menampilkan panel admin.</p></div></div>
    <div class="edition-switch" role="group" aria-label="Pilih versi aplikasi">
      <button class="edition-option${selected === 'lite' ? ' is-selected' : ''}" type="button" data-action="select-edition" data-edition="lite" aria-pressed="${selected === 'lite'}">Lite</button>
      <button class="edition-option${selected === 'pro' ? ' is-selected' : ''}" type="button" data-action="select-edition" data-edition="pro" aria-pressed="${selected === 'pro'}">Pro</button>
    </div>
  </section>`;
}

export function renderSettingsShortcut(icon) {
  return `<a class="settings-shortcut" href="#/settings" data-page="settings" aria-label="Pengaturan" title="Pengaturan">${icon('settings')}<span class="settings-shortcut-label">Pengaturan</span></a>`;
}

export function renderProPanel() {
  return `<section class="pro-panel" aria-label="Panel admin Pro">
    <iframe class="pro-embed-frame" src="./admin.html" title="Panel admin Smart Poultry Pro"></iframe>
  </section>`;
}
