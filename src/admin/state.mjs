const ADMIN_PAGES = new Set(['dashboard', 'users', 'coops', 'rules', 'cameras', 'logs', 'settings']);
const ROLES = new Set(['admin', 'pengguna']);
const LIGHT_COLORS = new Set(['red', 'warm-white']);
const DEVICE_STATES = new Set(['online', 'offline', 'warning']);

const SEED_USERS = [
  { id: 'u-1', name: 'Dalfa Pratama', email: 'dalfa@kandang.id', role: 'admin', coopId: null, active: true, lastActive: 'Baru saja', simulated: true },
  { id: 'u-2', name: 'Rani Kusuma', email: 'rani@kandang.id', role: 'pengguna', coopId: 'coop-1', active: true, lastActive: '5 menit lalu', simulated: true },
  { id: 'u-3', name: 'Bagas Nugroho', email: 'bagas@kandang.id', role: 'pengguna', coopId: 'coop-2', active: true, lastActive: '1 jam lalu', simulated: true },
  { id: 'u-4', name: 'Sari Wulandari', email: 'sari@kandang.id', role: 'pengguna', coopId: 'coop-1', active: false, lastActive: '3 hari lalu', simulated: true },
];

const SEED_COOPS = [
  { id: 'coop-1', name: 'Kandang Utama', location: 'Blitar, Jawa Timur', flockCount: 12, status: 'aktif', simulated: true },
  { id: 'coop-2', name: 'Kandang Pembesaran', location: 'Blitar, Jawa Timur', flockCount: 24, status: 'aktif', simulated: true },
  { id: 'coop-3', name: 'Kandang Cadangan', location: 'Malang, Jawa Timur', flockCount: 0, status: 'nonaktif', simulated: true },
];

const SEED_DEVICES = [
  { id: 'dev-1', name: 'Node ESP Kandang Utama', type: 'esp', coopId: 'coop-1', status: 'online', firmware: 'v1.2.0', lastHeartbeat: '12 detik lalu', simulated: true },
  { id: 'dev-2', name: 'Sensor Suhu DHT22', type: 'sensor', coopId: 'coop-1', status: 'online', firmware: 'v1.2.0', lastHeartbeat: '12 detik lalu', simulated: true },
  { id: 'dev-3', name: 'Sensor Berat Load Cell', type: 'sensor', coopId: 'coop-1', status: 'warning', firmware: 'v1.1.4', lastHeartbeat: '6 menit lalu', simulated: true },
  { id: 'dev-4', name: 'Kamera YOLO Atas', type: 'camera', coopId: 'coop-1', status: 'offline', firmware: 'v0.9.2', lastHeartbeat: '2 jam lalu', simulated: true },
  { id: 'dev-5', name: 'Node ESP Pembesaran', type: 'esp', coopId: 'coop-2', status: 'online', firmware: 'v1.2.0', lastHeartbeat: '30 detik lalu', simulated: true },
  { id: 'dev-6', name: 'Valve Air Otomatis', type: 'actuator', coopId: 'coop-2', status: 'online', firmware: 'v1.2.0', lastHeartbeat: '30 detik lalu', simulated: true },
];

const SEED_CAMERAS = [
  { id: 'cam-1', name: 'Kamera Atas', coopId: 'coop-1', streamUrl: 'rtsp://192.168.1.20/stream1', confidence: 70, triggerAction: 'catat', active: true, simulated: true },
  { id: 'cam-2', name: 'Kamera Telur', coopId: 'coop-1', streamUrl: 'rtsp://192.168.1.21/stream1', confidence: 60, triggerAction: 'valve', active: false, simulated: true },
];

const SEED_ALERTS = [
  { id: 'al-1', level: 'kritis', title: 'Kamera YOLO terputus', detail: 'Kamera YOLO Atas tidak mengirim data selama 2 jam.', coopId: 'coop-1', time: '10:12', acknowledged: false, simulated: true },
  { id: 'al-2', level: 'peringatan', title: 'Sensor berat lambat', detail: 'Heartbeat sensor berat terlambat 6 menit dari jadwal.', coopId: 'coop-1', time: '09:58', acknowledged: false, simulated: true },
  { id: 'al-3', level: 'info', title: 'Firmware usang', detail: 'Sensor Berat Load Cell masih v1.1.4, tersedia v1.2.0.', coopId: 'coop-1', time: '09:40', acknowledged: false, simulated: true },
];

const SEED_AUDIT = [
  { id: 'au-1', actor: 'Dalfa Pratama', action: 'Mengubah ambang suhu', target: 'Kandang Utama', time: '10:05', simulated: true },
  { id: 'au-2', actor: 'Dalfa Pratama', action: 'Menonaktifkan pengguna', target: 'Sari Wulandari', time: '09:31', simulated: true },
  { id: 'au-3', actor: 'Dalfa Pratama', action: 'Menambah perangkat', target: 'Valve Air Otomatis', time: '08:47', simulated: true },
  { id: 'au-4', actor: 'Sistem', action: 'Mencatat alert kritis', target: 'Kamera YOLO Atas', time: '08:12', simulated: true },
];

export function createAdminState() {
  return {
    mode: 'simulation',
    session: null,
    currentUser: { id: 'u-1', name: 'Dalfa Pratama', role: 'admin' },
    users: SEED_USERS.map((item) => ({ ...item })),
    coops: SEED_COOPS.map((item) => ({ ...item })),
    devices: SEED_DEVICES.map((item) => ({ ...item })),
    cameras: SEED_CAMERAS.map((item) => ({ ...item })),
    alerts: SEED_ALERTS.map((item) => ({ ...item })),
    auditLog: SEED_AUDIT.map((item) => ({ ...item })),
    rules: {
      temperature: { min: 24, max: 32, unit: '°C', enabled: true },
      humidity: { min: 55, max: 75, unit: '%', enabled: true },
      feed: { enabled: true, notifyWhenEmpty: true },
      waterValve: { enabled: false, openBelow: 60 },
      lighting: { enabled: true, onTime: '17:00', offTime: '22:00', color: 'warm-white' },
      music: { enabled: false, onTime: '06:00', offTime: '09:00' },
      egg: { enabled: true, thresholdGram: 50 },
    },
    ui: { userSearch: '', userRole: 'all', coopFilter: 'all', modal: null },
    theme: 'light',
    nextUserId: 5,
    nextAuditId: 5,
  };
}

export function normalizeAdminPage(page) {
  return ADMIN_PAGES.has(page) ? page : 'dashboard';
}

function logAudit(state, action, target) {
  const entry = {
    id: `au-${state.nextAuditId}`,
    actor: state.currentUser.name,
    action,
    target,
    time: 'Baru saja',
    simulated: true,
  };
  return { ...state, nextAuditId: state.nextAuditId + 1, auditLog: [entry, ...state.auditLog] };
}

export function enterAsAdmin(state) {
  return { ...state, session: 'admin' };
}

export function exitSession(state) {
  return { ...state, session: null, ui: { ...state.ui, modal: null } };
}

export function openModal(state, modal) {
  return { ...state, ui: { ...state.ui, modal } };
}

export function closeModal(state) {
  return { ...state, ui: { ...state.ui, modal: null } };
}

export function setUserSearch(state, value) {
  return { ...state, ui: { ...state.ui, userSearch: String(value ?? '') } };
}

export function setUserRoleFilter(state, role) {
  if (role !== 'all' && !ROLES.has(role)) throw new Error(`Unknown role filter: ${role}`);
  return { ...state, ui: { ...state.ui, userRole: role } };
}

export function filterUsers(state) {
  const query = state.ui.userSearch.trim().toLowerCase();
  return state.users.filter((user) => {
    const matchesRole = state.ui.userRole === 'all' || user.role === state.ui.userRole;
    if (!matchesRole) return false;
    if (!query) return true;
    return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });
}

function assertEmail(value) {
  const email = String(value ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Format email tidak valid');
  return email;
}

export function addUser(state, input) {
  const name = String(input?.name ?? '').trim();
  if (name.length < 2) throw new Error('Nama pengguna minimal 2 karakter');
  const email = assertEmail(input?.email);
  if (state.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email sudah dipakai pengguna lain');
  }
  if (!ROLES.has(input?.role)) throw new Error(`Role tidak dikenal: ${input?.role}`);
  const user = {
    id: `u-${state.nextUserId}`,
    name,
    email,
    role: input.role,
    coopId: input.role === 'admin' ? null : (input.coopId || null),
    active: true,
    lastActive: 'Belum pernah masuk',
    simulated: true,
  };
  const next = {
    ...state,
    nextUserId: state.nextUserId + 1,
    users: [...state.users, user],
    ui: { ...state.ui, modal: null },
  };
  return logAudit(next, 'Menambah pengguna', name);
}

export function updateUser(state, userId, input) {
  const existing = state.users.find((user) => user.id === userId);
  if (!existing) throw new Error(`Pengguna tidak ditemukan: ${userId}`);
  const name = String(input?.name ?? '').trim();
  if (name.length < 2) throw new Error('Nama pengguna minimal 2 karakter');
  const email = assertEmail(input?.email);
  if (state.users.some((user) => user.id !== userId && user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email sudah dipakai pengguna lain');
  }
  if (!ROLES.has(input?.role)) throw new Error(`Role tidak dikenal: ${input?.role}`);
  const next = {
    ...state,
    users: state.users.map((user) => (user.id === userId
      ? { ...user, name, email, role: input.role, coopId: input.role === 'admin' ? null : (input.coopId || null) }
      : user)),
    ui: { ...state.ui, modal: null },
  };
  return logAudit(next, 'Mengubah pengguna', name);
}

export function toggleUserActive(state, userId) {
  const existing = state.users.find((user) => user.id === userId);
  if (!existing) throw new Error(`Pengguna tidak ditemukan: ${userId}`);
  if (existing.id === state.currentUser.id) throw new Error('Tidak bisa menonaktifkan akun yang sedang dipakai');
  const next = {
    ...state,
    users: state.users.map((user) => (user.id === userId ? { ...user, active: !user.active } : user)),
  };
  return logAudit(next, existing.active ? 'Menonaktifkan pengguna' : 'Mengaktifkan pengguna', existing.name);
}

export function setRuleValue(state, section, field, value) {
  const current = state.rules[section];
  if (!current) throw new Error(`Aturan tidak dikenal: ${section}`);
  if (!(field in current)) throw new Error(`Kolom aturan tidak dikenal: ${section}.${field}`);
  if (field === 'color' && !LIGHT_COLORS.has(value)) throw new Error(`Warna lampu tidak didukung: ${value}`);
  if (field === 'min' || field === 'max' || field === 'openBelow' || field === 'thresholdGram') {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`Nilai ${field} harus berupa angka`);
    if (number < 0) throw new Error(`Nilai ${field} tidak boleh negatif`);
    value = number;
  }
  const nextRules = { ...state.rules, [section]: { ...current, [field]: value } };
  if (section === 'temperature' || section === 'humidity') {
    if (nextRules[section].min >= nextRules[section].max) {
      throw new Error('Batas minimum harus lebih kecil dari maksimum');
    }
  }
  const next = { ...state, rules: nextRules };
  return logAudit(next, `Mengubah aturan ${section}`, `${field}: ${value}`);
}

export function toggleRule(state, section) {
  const current = state.rules[section];
  if (!current) throw new Error(`Aturan tidak dikenal: ${section}`);
  if (!('enabled' in current)) throw new Error(`Aturan ${section} tidak bisa diaktifkan`);
  const next = {
    ...state,
    rules: { ...state.rules, [section]: { ...current, enabled: !current.enabled } },
  };
  return logAudit(next, current.enabled ? 'Menonaktifkan aturan' : 'Mengaktifkan aturan', section);
}

export function setCoopFilter(state, coopId) {
  if (coopId !== 'all' && !state.coops.some((coop) => coop.id === coopId)) {
    throw new Error(`Kandang tidak dikenal: ${coopId}`);
  }
  return { ...state, ui: { ...state.ui, coopFilter: coopId } };
}

export function acknowledgeAlert(state, alertId) {
  const alert = state.alerts.find((item) => item.id === alertId);
  if (!alert) throw new Error(`Alert tidak dikenal: ${alertId}`);
  const next = {
    ...state,
    alerts: state.alerts.map((item) => (item.id === alertId ? { ...item, acknowledged: true } : item)),
  };
  return logAudit(next, 'Menandai alert dibaca', alert.title);
}

export function toggleCamera(state, cameraId) {
  const camera = state.cameras.find((item) => item.id === cameraId);
  if (!camera) throw new Error(`Kamera tidak dikenal: ${cameraId}`);
  const next = {
    ...state,
    cameras: state.cameras.map((item) => (item.id === cameraId ? { ...item, active: !item.active } : item)),
  };
  return logAudit(next, camera.active ? 'Menonaktifkan kamera' : 'Mengaktifkan kamera', camera.name);
}

export function toggleDeviceState(state, deviceId) {
  const device = state.devices.find((item) => item.id === deviceId);
  if (!device) throw new Error(`Perangkat tidak dikenal: ${deviceId}`);
  if (!DEVICE_STATES.has(device.status)) throw new Error(`Status perangkat tidak dikenal: ${device.status}`);
  const nextStatus = device.status === 'offline' ? 'online' : 'offline';
  const next = {
    ...state,
    devices: state.devices.map((item) => (item.id === deviceId ? { ...item, status: nextStatus } : item)),
  };
  return logAudit(next, nextStatus === 'online' ? 'Menyambungkan perangkat' : 'Memutus perangkat', device.name);
}

export function summarize(state) {
  const online = state.devices.filter((device) => device.status === 'online').length;
  const warning = state.devices.filter((device) => device.status === 'warning').length;
  const offline = state.devices.filter((device) => device.status === 'offline').length;
  return {
    totalCoops: state.coops.length,
    activeCoops: state.coops.filter((coop) => coop.status === 'aktif').length,
    totalUsers: state.users.length,
    activeUsers: state.users.filter((user) => user.active).length,
    totalDevices: state.devices.length,
    online,
    warning,
    offline,
    openAlerts: state.alerts.filter((alert) => !alert.acknowledged).length,
    flockTotal: state.coops.reduce((total, coop) => total + coop.flockCount, 0),
  };
}

export function toggleTheme(state) {
  return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
}

export function resetAdminDemo(state) {
  const fresh = createAdminState();
  return { ...fresh, session: state.session, currentUser: state.currentUser, theme: state.theme };
}

export { ADMIN_PAGES, ROLES, LIGHT_COLORS, DEVICE_STATES };
