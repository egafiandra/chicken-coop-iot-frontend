const CONTROL_KEYS = new Set(['waterValve', 'lighting', 'music']);
const LIGHT_COLORS = new Set(['red', 'warm-white']);
const PAGES = new Set(['home', 'monitor', 'controls', 'camera', 'eggs', 'history']);
const HISTORY_FILTERS = new Set(['all', 'sensor', 'control', 'camera', 'egg']);

const SEED_EVENTS = [
  {
    id: 'sample-camera-2', type: 'camera', title: 'Ayam terdeteksi',
    detail: 'Keyakinan model 94%. Menunggu aksi trigger.', time: '08:26', simulated: true,
  },
  {
    id: 'sample-sensor-2', type: 'sensor', title: 'Suhu dan kelembapan',
    detail: '28.4 °C dan 67%.', time: '08:20', simulated: true,
  },
  {
    id: 'sample-sensor-1', type: 'sensor', title: 'Tempat pakan',
    detail: 'Pakan tersedia.', time: '08:13', simulated: true,
  },
  {
    id: 'sample-egg-1', type: 'egg', title: 'Perubahan berat',
    detail: '+58 g. Indikasi perubahan berat, belum konfirmasi telur.', time: '08:05', simulated: true,
  },
  {
    id: 'sample-control-1', type: 'control', title: 'Lampu kandang',
    detail: 'Warm white.', time: '07:55', simulated: true,
  },
];

export function createInitialState() {
  return {
    mode: 'simulation',
    flockCount: 12,
    controls: { waterValve: false, lighting: false, music: false },
    lightColor: 'warm-white',
    telemetry: {
      temperature: { value: 28.4, unit: '°C', simulated: true },
      humidity: { value: 67, unit: '%', simulated: true },
      feed: { available: true, simulated: true },
      water: { flowLpm: 0, valveOpen: false, simulated: true },
      weight: { delta: 58, unit: 'g', simulated: true },
      updatedAt: '08:30',
    },
    chartSeries: {
      labels: ['08:00', '08:06', '08:12', '08:18', '08:24', '08:30'],
      temperature: [27.6, 27.9, 28.1, 28.0, 28.3, 28.4],
      humidity: [71, 70, 69, 68, 67, 67],
    },
    detections: [
      { id: 'sample-detection-2', className: 'Ayam', confidence: 94, time: '08:26', triggerStatus: 'Belum dicoba', simulated: true },
      { id: 'sample-detection-1', className: 'Ayam', confidence: 89, time: '08:18', triggerStatus: 'Dicatat', simulated: true },
    ],
    events: SEED_EVENTS.map((event) => ({ ...event })),
    nextEventId: 1,
    nextDetectionId: 1,
    historyFilter: 'all',
  };
}

function insertSimulatedEvent(state, { type, title, detail }) {
  if (!HISTORY_FILTERS.has(type) || type === 'all') throw new Error(`Unknown event type: ${type}`);
  if (!title?.trim() || !detail?.trim()) throw new Error('Simulated events need a title and detail');
  const event = { id: `sim-${state.nextEventId}`, type, title, detail, time: 'Baru saja', simulated: true };
  return { ...state, nextEventId: state.nextEventId + 1, events: [event, ...state.events] };
}

export function addSimulatedEvent(state, event) {
  return insertSimulatedEvent(state, event);
}

export function toggleControl(state, controlKey) {
  if (!CONTROL_KEYS.has(controlKey)) throw new Error(`Unknown control: ${controlKey}`);
  const nextValue = !state.controls[controlKey];
  let next = { ...state, controls: { ...state.controls, [controlKey]: nextValue } };
  if (controlKey === 'waterValve') {
    next = {
      ...next,
      telemetry: {
        ...next.telemetry,
        water: { ...next.telemetry.water, valveOpen: nextValue, flowLpm: nextValue ? 0.7 : 0 },
      },
    };
  }
  const details = {
    waterValve: `Valve air minum ${nextValue ? 'dibuka' : 'ditutup'}.`,
    lighting: `Lampu ${nextValue ? 'menyala' : 'mati'} dengan warna ${next.lightColor}.`,
    music: `Musik klasik ${nextValue ? 'menyala' : 'mati'}.`,
  };
  const titles = { waterValve: 'Valve air minum', lighting: 'Lampu kandang', music: 'Musik klasik' };
  return insertSimulatedEvent(next, { type: 'control', title: titles[controlKey], detail: details[controlKey] });
}

export function toggleFeedScenario(state) {
  const available = !state.telemetry.feed.available;
  const next = { ...state, telemetry: { ...state.telemetry, feed: { ...state.telemetry.feed, available } } };
  return insertSimulatedEvent(next, {
    type: 'sensor', title: 'Tempat pakan',
    detail: `${available ? 'Pakan tersedia' : 'Tempat pakan habis'}.`,
  });
}

export function setLightColor(state, color) {
  if (!LIGHT_COLORS.has(color)) throw new Error(`Unsupported light color: ${color}`);
  return insertSimulatedEvent({ ...state, lightColor: color }, {
    type: 'control', title: 'Warna lampu', detail: `Pilihan ${color} diterapkan.`,
  });
}

export function addSimulatedDetection(state) {
  const detection = {
    id: `sample-detection-new-${state.nextDetectionId}`,
    className: 'Ayam', confidence: 92, time: 'Baru saja',
    triggerStatus: 'Belum dicoba', simulated: true,
  };
  const next = {
    ...state,
    nextDetectionId: state.nextDetectionId + 1,
    detections: [detection, ...state.detections],
  };
  return insertSimulatedEvent(next, {
    type: 'camera', title: 'Deteksi kamera',
    detail: `${detection.className}, keyakinan ${detection.confidence}%.`,
  });
}

export function simulateEspTrigger(state, detectionId) {
  const detection = state.detections.find((item) => item.id === detectionId);
  if (!detection) throw new Error(`Unknown detection: ${detectionId}`);
  if (detection.triggerStatus === 'Berhasil') return state;
  const next = {
    ...state,
    detections: state.detections.map((item) => item.id === detectionId
      ? { ...item, triggerStatus: 'Berhasil' }
      : item),
  };
  return insertSimulatedEvent(next, {
    type: 'control', title: 'Trigger ESP',
    detail: `Trigger dicatat untuk ${detection.className}.`,
  });
}

export function addSimulatedEggEvent(state) {
  return insertSimulatedEvent(state, {
    type: 'egg', title: 'Indikasi perubahan berat',
    detail: `Perubahan +${state.telemetry.weight.delta} ${state.telemetry.weight.unit}. Belum terkonfirmasi sebagai telur.`,
  });
}

export function filterEvents(events, filter) {
  if (!HISTORY_FILTERS.has(filter)) throw new Error(`Unknown history filter: ${filter}`);
  return filter === 'all' ? [...events] : events.filter((event) => event.type === filter);
}

export function normalizePage(page) {
  return PAGES.has(page) ? page : 'home';
}

export function setHistoryFilter(state, filter) {
  if (!HISTORY_FILTERS.has(filter)) throw new Error(`Unknown history filter: ${filter}`);
  return { ...state, historyFilter: filter };
}

export function resetDemo() {
  return createInitialState();
}
