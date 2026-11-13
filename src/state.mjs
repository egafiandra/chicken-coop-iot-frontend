const PAGES = new Set(['login', 'signup', 'home', 'monitor', 'controls', 'camera', 'notifications', 'profile']);
const CONTROL_KEYS = new Set(['waterValve', 'lighting', 'music']);

const INITIAL_NOTIFICATIONS = [
  { id: 'notice-1', title: 'Tempat pakan', message: 'Pakan tersedia.', time: '08:13', read: false, kind: 'feed' },
  { id: 'notice-2', title: 'Kondisi kandang', message: 'Suhu 28.4 °C, kelembapan 67%.', time: '08:20', read: false, kind: 'sensor' },
  { id: 'notice-3', title: 'Lampu kandang', message: 'Lampu dalam keadaan mati.', time: '07:55', read: true, kind: 'control' },
];

export function createInitialState() {
  return {
    isAuthenticated: false,
    role: 'user',
    flockCount: 12,
    profile: { name: '', email: '', phone: '' },
    controls: { waterValve: false, lighting: false, music: false },
    lightMode: 'red-and-warm-white',
    musicVolume: 45,
    telemetry: {
      temperatureC: 28.4,
      humidityPercent: 67,
      feedAvailable: true,
      waterValveOpen: false,
    },
    chartSeries: {
      labels: ['08:00', '08:06', '08:12', '08:18', '08:24', '08:30'],
      temperature: [27.6, 27.9, 28.1, 28.0, 28.3, 28.4],
      humidity: [71, 70, 69, 68, 67, 67],
    },
    notifications: INITIAL_NOTIFICATIONS.map((notification) => ({ ...notification })),
  };
}

export function getHomeDashboardModel(state) {
  return {
    displayName: state.profile.name || 'Pengguna',
    connectionLabel: 'IoT belum terhubung',
    flockCount: state.flockCount,
    temperatureC: state.telemetry.temperatureC,
    humidityPercent: state.telemetry.humidityPercent,
    feedLabel: state.telemetry.feedAvailable ? 'Tersedia' : 'Habis',
    valveLabel: state.controls.waterValve ? 'Terbuka' : 'Tertutup',
    lightingLabel: state.controls.lighting ? 'Menyala' : 'Mati',
    musicLabel: state.controls.music ? 'Menyala' : 'Mati',
    musicVolume: state.musicVolume,
    unreadNotifications: state.notifications.filter((notification) => !notification.read).length,
    notifications: state.notifications.slice(0, 2),
  };
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function loginUser(state, email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  if (!validEmail(normalizedEmail)) throw new Error('Enter a valid email');
  return {
    ...state,
    isAuthenticated: true,
    role: 'user',
    profile: { ...state.profile, email: normalizedEmail },
  };
}

export function logoutUser(state) {
  return {
    ...state,
    isAuthenticated: false,
    profile: { ...state.profile, email: '' },
  };
}

export function updateProfile(state, profile) {
  const next = {
    name: String(profile.name ?? '').trim(),
    email: String(profile.email ?? '').trim().toLowerCase(),
    phone: String(profile.phone ?? '').trim(),
  };
  if (!next.name || next.name.length > 80) throw new Error('Enter a valid name');
  if (!validEmail(next.email)) throw new Error('Enter a valid email');
  if (next.phone.length > 30) throw new Error('Enter a valid phone number');
  return { ...state, profile: next };
}

export function toggleControl(state, controlKey) {
  if (!CONTROL_KEYS.has(controlKey)) throw new Error(`Unknown control: ${controlKey}`);
  const enabled = !state.controls[controlKey];
  return {
    ...state,
    controls: { ...state.controls, [controlKey]: enabled },
    telemetry: controlKey === 'waterValve'
      ? { ...state.telemetry, waterValveOpen: enabled }
      : state.telemetry,
  };
}

export function setMusicVolume(state, value) {
  const volume = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(volume) || !Number.isInteger(volume)) throw new Error('Volume must be a number');
  if (volume < 0 || volume > 100) throw new Error('Volume must be between 0 and 100');
  return { ...state, musicVolume: volume };
}

export function markNotificationRead(state, id) {
  const exists = state.notifications.some((notification) => notification.id === id);
  if (!exists) throw new Error(`Unknown notification: ${id}`);
  return {
    ...state,
    notifications: state.notifications.map((notification) => notification.id === id
      ? { ...notification, read: true }
      : notification),
  };
}

export function markAllNotificationsRead(state) {
  return {
    ...state,
    notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
  };
}

export function unreadCount(state) {
  return state.notifications.reduce((count, notification) => count + Number(!notification.read), 0);
}

export function normalizePage(page) {
  return PAGES.has(page) ? page : 'home';
}
