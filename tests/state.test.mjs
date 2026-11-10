import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSimulatedDetection,
  addSimulatedEggEvent,
  addSimulatedEvent,
  createInitialState,
  filterEvents,
  normalizePage,
  resetDemo,
  setHistoryFilter,
  setLightColor,
  simulateEspTrigger,
  toggleControl,
  toggleFeedScenario,
} from '../src/state.mjs';

test('initial simulation contains clearly marked sample data for the requested modules', () => {
  const state = createInitialState();
  assert.equal(state.flockCount, 12);
  assert.equal(state.mode, 'simulation');
  assert.equal(state.telemetry.temperature.value, 28.4);
  assert.equal(state.telemetry.temperature.simulated, true);
  assert.equal(state.telemetry.feed.available, true);
  assert.equal(state.telemetry.weight.delta, 58);
  assert.equal(state.detections[0].simulated, true);
  assert.equal(state.events.every((event) => event.simulated), true);
});

test('a simulated valve toggle changes demo flow and records a local event', () => {
  const initial = createInitialState();
  const next = toggleControl(initial, 'waterValve');
  assert.equal(next.controls.waterValve, true);
  assert.equal(next.telemetry.water.flowLpm, 0.7);
  assert.equal(next.events[0].type, 'control');
  assert.equal(next.events[0].simulated, true);
  assert.equal(initial.controls.waterValve, false);
  assert.equal(initial.telemetry.water.flowLpm, 0);
});

test('pakan scenario switches between available and empty and records the change', () => {
  const initial = createInitialState();
  const empty = toggleFeedScenario(initial);
  assert.equal(empty.telemetry.feed.available, false);
  assert.equal(empty.events[0].type, 'sensor');
  assert.equal(toggleFeedScenario(empty).telemetry.feed.available, true);
});

test('YOLO detection and ESP trigger can be rehearsed without touching hardware', () => {
  const initial = createInitialState();
  const withDetection = addSimulatedDetection(initial);
  assert.equal(withDetection.detections.length, initial.detections.length + 1);
  const detectionId = withDetection.detections[0].id;
  const triggered = simulateEspTrigger(withDetection, detectionId);
  assert.equal(triggered.detections[0].triggerStatus, 'Berhasil');
  assert.equal(triggered.controls.waterValve, initial.controls.waterValve);
  assert.equal(triggered.events[0].type, 'control');
  assert.equal(triggered.events[0].simulated, true);
  assert.strictEqual(simulateEspTrigger(triggered, detectionId), triggered);
});

test('egg indication and history filtering remain explicitly simulated', () => {
  const initial = createInitialState();
  const next = addSimulatedEggEvent(initial);
  assert.equal(next.events[0].type, 'egg');
  assert.equal(next.events[0].simulated, true);
  assert.ok(filterEvents(next.events, 'camera').length >= 1);
  assert.equal(filterEvents(next.events, 'egg').length, 2);
  assert.throws(() => filterEvents(next.events, 'unknown'), /Unknown history filter/);
});

test('light colors and control identifiers are validated', () => {
  const initial = createInitialState();
  assert.equal(setLightColor(initial, 'red').lightColor, 'red');
  assert.equal(setLightColor(initial, 'warm-white').lightColor, 'warm-white');
  assert.throws(() => setLightColor(initial, 'blue'), /Unsupported light color/);
  assert.throws(() => toggleControl(initial, 'camera'), /Unknown control/);
  assert.throws(() => addSimulatedEvent(initial, { type: 'unknown', title: 'x', detail: 'x' }), /Unknown event type/);
});

test('reset restores the demo fixture and routes reject unknown pages', () => {
  const changed = toggleControl(createInitialState(), 'music');
  assert.equal(resetDemo(changed).controls.music, false);
  assert.equal(normalizePage('camera'), 'camera');
  assert.equal(normalizePage('not-a-page'), 'home');
  assert.equal(setHistoryFilter(createInitialState(), 'camera').historyFilter, 'camera');
  assert.throws(() => setHistoryFilter(createInitialState(), 'unknown'), /Unknown history filter/);
});
