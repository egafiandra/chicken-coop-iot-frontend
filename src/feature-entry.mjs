export function shouldPlayFeatureEntry(previousPageId, nextPageId) {
  return previousPageId != null && previousPageId !== nextPageId;
}

const featureEntryCardSelector = [
  '.home-dashboard > .coop-hero',
  '.home-dashboard > .environment-masthead',
  '.home-dashboard .quick-menu-tile',
  '.monitor-dashboard > .monitor-environment',
  '.monitor-dashboard .trend-card',
  '.monitor-dashboard > .monitor-summary',
  '.page-stack > .controls-scene-strip',
  '.control-grid > .control-card',
  '.page-stack > .camera-view-card',
  '.page-stack > .notifications-card',
  '.page-stack > .profile-summary',
  '.page-stack > .profile-form-card',
].join(', ');

export function attachFeatureEntryCards(root, staggerMs = 100) {
  if (!root?.querySelectorAll || !root?.classList) return 0;

  const cards = [...root.querySelectorAll(featureEntryCardSelector)];
  if (!cards.length) return 0;

  root.classList.add('is-feature-staggering');
  cards.forEach((card, index) => {
    card.classList.add('is-feature-card-entering');
    card.style.setProperty('--feature-card-entry-delay', `${index * staggerMs}ms`);
  });

  return cards.length;
}
