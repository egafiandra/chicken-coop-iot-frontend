import test from 'node:test';
import assert from 'node:assert/strict';
import { attachScrollReveal } from '../src/scroll-reveal.mjs';

function classList() {
  const names = new Set();
  return {
    add: (name) => names.add(name),
    remove: (name) => names.delete(name),
    contains: (name) => names.has(name),
  };
}

function element() {
  const values = new Map();
  return {
    dataset: {},
    classList: classList(),
    style: {
      setProperty: (name, value) => values.set(name, value),
      removeProperty: (name) => values.delete(name),
      getPropertyValue: (name) => values.get(name) ?? '',
    },
  };
}

function rootFor(selectors) {
  return {
    classList: classList(),
    querySelectorAll: (selector) => selectors[selector] ?? [],
  };
}

class ObserverDouble {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.targets = new Set();
    this.disconnected = false;
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.disconnected = true; this.targets.clear(); }
  enter(target) { this.callback([{ target, isIntersecting: true }]); }
}

test('scroll reveal observes sections once, staggers tiles, and cleans up', () => {
  const hero = element();
  const tileA = element();
  const tileB = element();
  const root = rootFor({
    '.home-dashboard > .coop-hero': [hero],
    '.home-dashboard .quick-menu-tile': [tileA, tileB],
  });
  let observer;
  class TestObserver extends ObserverDouble {
    constructor(callback, options) {
      super(callback, options);
      observer = this;
    }
  }

  const cleanup = attachScrollReveal(root, {
    prefersReducedMotion: false,
    IntersectionObserver: TestObserver,
  });

  assert.equal(root.classList.contains('has-scroll-motion'), true);
  assert.equal(observer.targets.size, 3);
  assert.equal(hero.dataset.scrollReveal, '');
  assert.equal(tileB.style.getPropertyValue('--scroll-reveal-delay'), '55ms');
  assert.equal(observer.options.threshold, 0.14);
  observer.enter(tileB);
  assert.equal(tileB.classList.contains('is-visible'), true);
  assert.equal(tileB.style.getPropertyValue('--scroll-reveal-delay'), '55ms');
  assert.equal(observer.targets.has(tileB), false);
  observer.enter(tileA);
  assert.equal(tileA.classList.contains('is-visible'), true);
  assert.equal(observer.targets.has(tileA), false);

  cleanup();
  assert.equal(observer.disconnected, true);
  assert.equal(root.classList.contains('has-scroll-motion'), false);
  assert.equal(hero.dataset.scrollReveal, undefined);
  assert.equal(tileB.style.getPropertyValue('--scroll-reveal-delay'), '');
});

test('scroll reveal skips cards and nested contents already entering with the feature route', () => {
  const hero = element();
  const enteringTile = element();
  enteringTile.classList.add('is-feature-card-entering');
  const enteringProfileCard = element();
  const nestedHeading = element();
  nestedHeading.closest = (selector) => selector === '.is-feature-card-entering' ? enteringProfileCard : null;
  enteringProfileCard.classList.add('is-feature-card-entering');
  const root = rootFor({
    '.home-dashboard > .coop-hero': [hero],
    '.home-dashboard .quick-menu-tile': [enteringTile],
    '.profile-form-card > .section-heading': [nestedHeading],
  });
  let observer;
  class TestObserver extends ObserverDouble {
    constructor(callback, options) {
      super(callback, options);
      observer = this;
    }
  }

  const cleanup = attachScrollReveal(root, { IntersectionObserver: TestObserver });
  assert.equal(observer.targets.has(hero), true);
  assert.equal(observer.targets.has(enteringTile), false);
  assert.equal(observer.targets.has(nestedHeading), false);
  assert.equal(enteringTile.dataset.scrollReveal, undefined);
  assert.equal(nestedHeading.dataset.scrollReveal, undefined);
  cleanup();
});

test('scroll reveal observes desktop content when motion is enabled', () => {
  const hero = element();
  const root = rootFor({ '.home-dashboard > .coop-hero': [hero] });
  let observer;
  class TestObserver extends ObserverDouble {
    constructor(callback, options) {
      super(callback, options);
      observer = this;
    }
  }

  const cleanup = attachScrollReveal(root, { IntersectionObserver: TestObserver });
  assert.equal(root.classList.contains('has-scroll-motion'), true);
  assert.equal(observer.targets.has(hero), true);
  observer.enter(hero);
  assert.equal(hero.classList.contains('is-visible'), true);
  cleanup();
  assert.equal(observer.disconnected, true);
});

test('scroll reveal is skipped for reduced motion or missing observer', () => {
  for (const options of [
    { prefersReducedMotion: true, IntersectionObserver: ObserverDouble },
    { prefersReducedMotion: false },
  ]) {
    const hero = element();
    const root = rootFor({ '.home-dashboard > .coop-hero': [hero] });
    const cleanup = attachScrollReveal(root, options);
    assert.equal(root.classList.contains('has-scroll-motion'), false);
    assert.equal(hero.dataset.scrollReveal, undefined);
    cleanup();
  }
});

test('scroll reveal styles apply at all viewport widths when motion is allowed', async () => {
  const styles = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8'));
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[\s\S]*?\.page-content\.has-scroll-motion\s+\[data-scroll-reveal\]/);
  assert.doesNotMatch(styles, /@media\s*\(max-width:\s*820px\)\s+and\s+\(prefers-reduced-motion:\s*no-preference\)/);
});
