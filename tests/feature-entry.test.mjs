import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { attachFeatureEntryCards, shouldPlayFeatureEntry } from '../src/feature-entry.mjs';

test('feature entry animates only when a different feature route is opened', () => {
  assert.equal(shouldPlayFeatureEntry('home', 'monitor'), true);
  assert.equal(shouldPlayFeatureEntry('monitor', 'controls'), true);
  assert.equal(shouldPlayFeatureEntry('monitor', 'monitor'), false);
  assert.equal(shouldPlayFeatureEntry(null, 'home'), false);
});

test('feature cards stagger instead of moving the whole page as one block', async () => {
  const styles = await readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8');
  assert.doesNotMatch(styles, /\.page-content\.is-page-entering\s*\{[^}]*animation:/);
  assert.match(styles, /\.page-content\.is-feature-staggering \.is-feature-card-entering/);
});

test('feature cards receive ordered entrance delays when a feature route opens', () => {
  const makeCard = () => {
    const classes = new Set();
    const properties = new Map();
    return {
      classes,
      properties,
      classList: { add: (name) => classes.add(name) },
      style: { setProperty: (name, value) => properties.set(name, value) },
    };
  };
  const cards = [makeCard(), makeCard(), makeCard(), makeCard()];
  const rootClasses = new Set();
  const root = {
    classList: { add: (name) => rootClasses.add(name) },
    querySelectorAll(selector) {
      assert.match(selector, /\.home-dashboard \.quick-menu-tile/);
      assert.match(selector, /\.control-grid > \.control-card/);
      assert.match(selector, /\.page-stack > \.notifications-card/);
      assert.doesNotMatch(selector, /\.notifications-card \.notification-item/);
      return cards;
    },
  };

  assert.equal(attachFeatureEntryCards(root), 4);
  assert.ok(rootClasses.has('is-feature-staggering'));
  cards.forEach((card, index) => {
    assert.ok(card.classes.has('is-feature-card-entering'));
    assert.equal(card.properties.get('--feature-card-entry-delay'), `${index * 100}ms`);
  });

  const reducedCards = [makeCard(), makeCard()];
  const reducedRoot = { classList: { add() {} }, querySelectorAll: () => reducedCards };
  attachFeatureEntryCards(reducedRoot, 80);
  assert.deepEqual(reducedCards.map((card) => card.properties.get('--feature-card-entry-delay')), ['0ms', '80ms']);
});

test('feature cards slide horizontally from left to right without a pop-up scale', async () => {
  const styles = await readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8');
  const rule = styles.match(/\.page-content\.is-feature-staggering \.is-feature-card-entering\s*\{([^}]*)\}/)?.[1];
  const keyframes = styles.match(/@keyframes feature-card-slide-in\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.match(rule || '', /animation:\s*feature-card-slide-in\s+320ms/);
  assert.match(rule || '', /animation-delay:\s*var\(--feature-card-entry-delay, 0ms\)/);
  assert.match(keyframes || '', /translate3d\(-24px, 0, 0\)/);
  assert.match(keyframes || '', /translate3d\(0, 0, 0\)/);
  assert.doesNotMatch(keyframes || '', /scale\(|,\s*-?\d+px,\s*0\)/);
});

test('reduced-motion card slide uses shorter, lower-travel movement', async () => {
  const styles = await readFile(new URL('../src/user-mobile.css', import.meta.url), 'utf8');
  const baseStyles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  const reducedIndex = styles.lastIndexOf('@media (prefers-reduced-motion: reduce)');
  const reducedStyles = styles.slice(reducedIndex);
  const rule = reducedStyles.match(/\.page-content\.is-feature-staggering \.is-feature-card-entering\s*\{([^}]*)\}/)?.[1];
  const keyframes = reducedStyles.match(/@keyframes feature-card-slide-in-reduced\s*\{([\s\S]*?)\n  \}/)?.[1];
  assert.match(rule || '', /animation-name:\s*feature-card-slide-in-reduced/);
  assert.match(rule || '', /animation-duration:\s*180ms\s*!important/);
  assert.match(keyframes || '', /translate3d\(-10px, 0, 0\)/);
  assert.doesNotMatch(keyframes || '', /scale\(|,\s*-?\d+px,\s*0\)/);
  assert.match(baseStyles, /animation-duration:\s*0\.01ms\s*!important/);
});
