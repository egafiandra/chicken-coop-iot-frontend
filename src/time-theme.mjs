const PERIOD_LABELS = Object.freeze({
  siang: 'Siang',
  sore: 'Sore',
  malam: 'Malam',
});

function twoDigits(value) {
  return String(value).padStart(2, '0');
}

export function normalizeThemePreference(value) {
  return value === 'dark' || value === 'light' ? value : 'auto';
}

export function getTimeTheme(date = new Date(), preference = 'auto') {
  const hour = date.getHours();
  const period = hour >= 6 && hour < 17
    ? 'siang'
    : hour >= 17 && hour < 20
      ? 'sore'
      : 'malam';
  const normalizedPreference = normalizeThemePreference(preference);
  const colorMode = normalizedPreference === 'auto'
    ? (period === 'malam' ? 'dark' : 'light')
    : normalizedPreference;

  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    clock: `${twoDigits(hour)}:${twoDigits(date.getMinutes())}`,
    colorMode,
  };
}
