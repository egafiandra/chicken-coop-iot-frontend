export function initHeroLottie({
  container,
  fallback,
  observerTarget,
  control,
  lottie,
  reducedMotion,
  IntersectionObserverCtor,
  visibilityTarget,
  animationPath,
}) {
  const showFallback = () => {
    if (fallback) fallback.hidden = false;
    if (container) container.hidden = true;
  };
  const noCleanup = () => {};

  if (!container || !fallback || typeof lottie?.loadAnimation !== 'function') {
    showFallback();
    if (control) control.hidden = true;
    return noCleanup;
  }

  let animation = null;
  let ready = false;
  let failed = false;
  let inViewport = true;
  let playing = false;
  let enabled = !reducedMotion;
  let observer = null;

  const updateControl = () => {
    if (!control) return;
    control.hidden = failed;
    control.setAttribute('aria-pressed', String(enabled));
    control.setAttribute('aria-label', enabled ? 'Jeda animasi' : 'Putar animasi');
    control.setAttribute('data-state', enabled ? 'playing' : 'paused');
  };

  const updatePlayback = () => {
    if (failed || !animation) {
      if (!enabled) showFallback();
      updateControl();
      return;
    }
    if (!ready) {
      fallback.hidden = false;
      container.hidden = false;
      updateControl();
      return;
    }

    const canPlay = enabled && inViewport && !visibilityTarget?.hidden;
    if (canPlay) {
      container.hidden = false;
      fallback.hidden = true;
      if (!playing) {
        animation.play();
        playing = true;
      }
    } else {
      fallback.hidden = false;
      container.hidden = true;
      if (playing) {
        animation.pause();
        playing = false;
      }
    }
    updateControl();
  };

  const onLoaded = () => {
    ready = true;
    updatePlayback();
  };
  const onDataFailed = () => {
    failed = true;
    animation?.destroy?.();
    animation = null;
    showFallback();
    updateControl();
  };
  const onVisibilityChange = () => updatePlayback();
  const onControlClick = () => {
    enabled = !enabled;
    if (enabled && !animation) createAnimation();
    updatePlayback();
  };

  function createAnimation() {
    if (animation || failed) return;
    let candidate;
    try {
      candidate = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: animationPath,
      });
    } catch {
      failed = true;
      showFallback();
      updateControl();
      return;
    }

    if (!candidate?.addEventListener || !candidate?.play || !candidate?.pause) {
      candidate?.destroy?.();
      failed = true;
      showFallback();
      updateControl();
      return;
    }

    animation = candidate;
    container.hidden = false;
    fallback.hidden = false;
    animation.addEventListener('DOMLoaded', onLoaded);
    animation.addEventListener('data_failed', onDataFailed);
    updateControl();
  }

  control?.addEventListener?.('click', onControlClick);
  visibilityTarget?.addEventListener?.('visibilitychange', onVisibilityChange);
  updateControl();
  if (enabled) createAnimation();
  else showFallback();

  if (typeof IntersectionObserverCtor === 'function') {
    observer = new IntersectionObserverCtor((entries) => {
      const entry = entries.find((item) => item.target === (observerTarget || container)) || entries[0];
      if (!entry) return;
      inViewport = Boolean(entry.isIntersecting);
      updatePlayback();
    });
    observer.observe(observerTarget || container);
  }

  return () => {
    observer?.disconnect();
    control?.removeEventListener?.('click', onControlClick);
    visibilityTarget?.removeEventListener?.('visibilitychange', onVisibilityChange);
    animation?.removeEventListener?.('DOMLoaded', onLoaded);
    animation?.removeEventListener?.('data_failed', onDataFailed);
    if (playing) animation?.pause?.();
    animation?.destroy?.();
    animation = null;
    playing = false;
    enabled = false;
    showFallback();
    if (control) control.hidden = true;
  };
}
