const revealGroups = [
  { selector: '.home-dashboard > .coop-hero' },
  { selector: '.home-dashboard > .environment-masthead' },
  { selector: '.home-dashboard > .quick-access-section > .section-heading' },
  { selector: '.home-dashboard .quick-menu-tile', stagger: true },
  { selector: '.monitor-dashboard > .monitor-environment' },
  { selector: '.monitor-dashboard > .monitor-trend-section > .section-heading' },
  { selector: '.monitor-dashboard .trend-card', stagger: true },
  { selector: '.monitor-dashboard > .monitor-summary > .section-heading' },
  { selector: '.monitor-dashboard .monitor-device-list .device-status-row', stagger: true },
  { selector: '.page-stack > .controls-scene-strip' },
  { selector: '.control-grid > .control-card', stagger: true },
  { selector: '.page-stack > .camera-view-card' },
  { selector: '.notifications-card > .section-heading' },
  { selector: '.notifications-card .notification-item', stagger: true },
  { selector: '.page-stack > .profile-summary' },
  { selector: '.profile-form-card > .section-heading' },
  { selector: '.profile-form-card > .profile-form' },
];

const noop = () => {};

export function attachScrollReveal(root, {
  prefersReducedMotion = false,
  IntersectionObserver: Observer = globalThis.IntersectionObserver,
} = {}) {
  if (!root?.querySelectorAll || !root?.classList || prefersReducedMotion || typeof Observer !== 'function') {
    return noop;
  }

  const observedTargets = new Set();
  for (const group of revealGroups) {
    const elements = [...root.querySelectorAll(group.selector)];
    elements.forEach((element, index) => {
      if (observedTargets.has(element) || element.classList?.contains('is-feature-card-entering') || element.closest?.('.is-feature-card-entering')) return;
      observedTargets.add(element);
      element.dataset.scrollReveal = '';
      if (group.stagger) {
        const delay = Math.min(index, 4) * 55;
        element.style.setProperty('--scroll-reveal-delay', `${delay}ms`);
      }
    });
  }

  if (!observedTargets.size) return noop;

  root.classList.add('has-scroll-motion');
  let observer;
  observer = new Observer((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -6% 0px',
  });

  observedTargets.forEach((element) => observer.observe(element));

  return () => {
    observer.disconnect();
    root.classList.remove('has-scroll-motion');
    observedTargets.forEach((element) => {
      delete element.dataset.scrollReveal;
      element.classList.remove('is-visible');
      element.style.removeProperty('--scroll-reveal-delay');
    });
  };
}
