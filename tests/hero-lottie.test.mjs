import test from 'node:test';
import assert from 'node:assert/strict';
import { initHeroLottie } from '../src/hero-lottie.mjs';

function makeElement() {
  return { hidden: false };
}

function makeButton() {
  const listeners = new Map();
  const attributes = new Map();
  return {
    hidden: true,
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name) { listeners.delete(name); },
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name); },
    click() { listeners.get('click')?.(); },
  };
}

function makeHarness() {
  const container = makeElement();
  const fallback = makeElement();
  const observerTarget = makeElement();
  const control = makeButton();
  const events = new Map();
  const animation = {
    played: 0,
    paused: 0,
    destroyed: 0,
    addEventListener(name, listener) {
      events.set(name, listener);
    },
    play() { this.played += 1; },
    pause() { this.paused += 1; },
    destroy() { this.destroyed += 1; },
    emit(name) { events.get(name)?.(); },
  };
  let options = null;
  const lottie = {
    loadAnimation(nextOptions) {
      options = nextOptions;
      return animation;
    },
  };
  let observer = null;
  class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.target = null;
      this.disconnected = false;
      observer = this;
    }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    setVisible(isIntersecting) {
      this.callback([{ target: this.target, isIntersecting }]);
    }
  }
  const listeners = new Set();
  const visibilityTarget = {
    hidden: false,
    addEventListener(name, listener) {
      if (name === 'visibilitychange') listeners.add(listener);
    },
    removeEventListener(name, listener) {
      if (name === 'visibilitychange') listeners.delete(listener);
    },
    setHidden(hidden) {
      this.hidden = hidden;
      for (const listener of listeners) listener();
    },
    listenerCount: () => listeners.size,
  };
  const cleanup = (reducedMotion = false, player = lottie) => initHeroLottie({
    container,
    fallback,
    observerTarget,
    control,
    lottie: player,
    reducedMotion,
    IntersectionObserverCtor: FakeIntersectionObserver,
    visibilityTarget,
    animationPath: './src/assets/lottie/coop-hen.json?v=photo-1',
  });
  return { container, fallback, observerTarget, control, animation, cleanup, getOptions: () => options, getObserver: () => observer, visibilityTarget };
}

test('reduced motion shows poster without initializing player', () => {
  const h = makeHarness();
  const cleanup = h.cleanup(true);
  assert.equal(h.fallback.hidden, false);
  assert.equal(h.container.hidden, true);
  assert.equal(h.getOptions(), null);
  assert.equal(h.control.hidden, false);
  assert.equal(h.control.getAttribute('aria-label'), 'Putar animasi');
  assert.equal(h.control.getAttribute('aria-pressed'), 'false');
  assert.equal(typeof cleanup, 'function');
});

test('reduced-motion play control explicitly starts the animation', () => {
  const h = makeHarness();
  h.cleanup(true);
  h.control.click();
  assert.equal(h.getOptions().autoplay, false);
  assert.equal(h.control.getAttribute('aria-label'), 'Jeda animasi');
  h.animation.emit('DOMLoaded');
  assert.equal(h.animation.played, 1);
  assert.equal(h.container.hidden, false);
  assert.equal(h.fallback.hidden, true);
});

test('playback control pauses and resumes automatic animation', () => {
  const h = makeHarness();
  h.cleanup(false);
  h.animation.emit('DOMLoaded');
  h.control.click();
  assert.equal(h.animation.paused, 1);
  assert.equal(h.container.hidden, true);
  assert.equal(h.fallback.hidden, false);
  assert.equal(h.control.getAttribute('aria-label'), 'Putar animasi');
  h.control.click();
  assert.equal(h.animation.played, 2);
  assert.equal(h.container.hidden, false);
  assert.equal(h.fallback.hidden, true);
  assert.equal(h.control.getAttribute('aria-label'), 'Jeda animasi');
});

test('missing player leaves poster visible', () => {
  const h = makeHarness();
  h.cleanup(false, null);
  assert.equal(h.fallback.hidden, false);
  assert.equal(h.container.hidden, true);
  assert.equal(h.getOptions(), null);
  assert.equal(h.control.hidden, true);
});

test('failed animation data restores poster and destroys the failed player', () => {
  const h = makeHarness();
  h.cleanup();
  h.animation.emit('data_failed');
  assert.equal(h.fallback.hidden, false);
  assert.equal(h.container.hidden, true);
  assert.equal(h.animation.destroyed, 1);
  assert.equal(h.control.hidden, true);
});

test('animation pauses offscreen and resumes in view', () => {
  const h = makeHarness();
  h.cleanup();
  assert.equal(h.getOptions().renderer, 'svg');
  assert.equal(h.getOptions().loop, true);
  assert.equal(h.getOptions().autoplay, false);
  assert.equal(h.getOptions().path, './src/assets/lottie/coop-hen.json?v=photo-1');
  assert.equal(h.getObserver().target, h.observerTarget);
  h.animation.emit('DOMLoaded');
  assert.equal(h.fallback.hidden, true);
  assert.equal(h.animation.played, 1);
  h.getObserver().setVisible(false);
  assert.equal(h.animation.paused, 1);
  assert.equal(h.container.hidden, true);
  assert.equal(h.fallback.hidden, false);
  h.getObserver().setVisible(true);
  assert.equal(h.animation.played, 2);
  assert.equal(h.container.hidden, false);
  assert.equal(h.fallback.hidden, true);
});

test('animation pauses while hidden and resumes when visible', () => {
  const h = makeHarness();
  h.cleanup();
  h.animation.emit('DOMLoaded');
  h.visibilityTarget.setHidden(true);
  assert.equal(h.animation.paused, 1);
  assert.equal(h.container.hidden, true);
  assert.equal(h.fallback.hidden, false);
  h.visibilityTarget.setHidden(false);
  assert.equal(h.animation.played, 2);
  assert.equal(h.container.hidden, false);
  assert.equal(h.fallback.hidden, true);
});

test('cleanup disconnects observers, removes listeners, and destroys animation', () => {
  const h = makeHarness();
  const cleanup = h.cleanup();
  const options = h.getOptions();
  cleanup();
  assert.equal(h.getObserver().disconnected, true);
  assert.equal(h.visibilityTarget.listenerCount(), 0);
  assert.equal(h.animation.destroyed, 1);
  assert.equal(h.control.hidden, true);
  h.control.click();
  h.control.click();
  assert.equal(h.getOptions(), options, 'a cleaned-up control cannot create another player');
});
