(() => {
  const root = document.documentElement;
  const overlay = document.getElementById('brandSplash');
  const group = document.getElementById('brandSplashGroup');
  if (!root.classList.contains('splash-pending') || !overlay || !group) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const headerBrand = document.querySelector('.site-header .brand');
  const storageKey = 'bekamarBrandIntroSeen';
  let finished = false;
  let moveTimer;
  let taglineTimer;
  let fallbackTimer;
  let blockedElements = [];

  function setStartingPosition() {
    const width = group.offsetWidth;
    const height = group.offsetHeight;
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const offsetLeft = viewport?.offsetLeft ?? 0;
    const offsetTop = viewport?.offsetTop ?? 0;
    group.style.setProperty('--splash-x', `${Math.round(offsetLeft + (viewportWidth - width) / 2)}px`);
    group.style.setProperty('--splash-y', `${Math.round(offsetTop + (viewportHeight - height) / 2)}px`);
    overlay.style.setProperty('--splash-tagline-y', `${Math.round(offsetTop + (viewportHeight + height) / 2 + 8)}px`);
    group.style.removeProperty('--splash-scale');
  }

  function setHeaderTarget() {
    if (!headerBrand) return false;
    const target = headerBrand.getBoundingClientRect();
    if (!target.width || !target.height) return false;
    group.style.setProperty('--splash-x', `${target.left}px`);
    group.style.setProperty('--splash-y', `${target.top}px`);
    group.style.setProperty('--splash-scale', String(target.width / group.offsetWidth));
    return true;
  }

  function finish(immediate = false) {
    if (finished) return;
    finished = true;
    clearTimeout(moveTimer);
    clearTimeout(taglineTimer);
    clearTimeout(fallbackTimer);
    window.removeEventListener('resize', reposition);
    window.visualViewport?.removeEventListener('resize', reposition);
    reduceMotion.removeEventListener?.('change', onMotionChange);
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
    const cleanup = () => {
      blockedElements.forEach(({ element, wasInert, ariaHidden }) => {
        element.inert = wasInert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      blockedElements = [];
      root.classList.remove('splash-pending');
      document.body.classList.remove('splash-active');
      overlay.remove();
    };
    if (immediate || reduceMotion.matches) cleanup();
    else {
      overlay.classList.add('is-leaving');
      window.setTimeout(cleanup, 340);
    }
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  function reposition() {
    if (finished) return;
    if (group.classList.contains('is-moving')) setHeaderTarget();
    else setStartingPosition();
  }

  if (reduceMotion.matches) {
    finish(true);
    return;
  }

  document.body.classList.add('splash-active');
  blockedElements = [...document.body.children]
    .filter((element) => element !== overlay && element.tagName !== 'SCRIPT')
    .map((element) => {
      const state = { element, wasInert: element.inert, ariaHidden: element.getAttribute('aria-hidden') };
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
      return state;
    });
  setStartingPosition();
  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
    requestAnimationFrame(() => group.classList.add('is-visible'));
  });

  taglineTimer = window.setTimeout(() => overlay.classList.add('is-tagline-visible'), 1510);
  moveTimer = window.setTimeout(() => {
    if (finished) return;
    overlay.classList.add('is-tagline-leaving');
    group.classList.add('is-moving');
    if (!setHeaderTarget()) {
      finish();
      return;
    }
    moveTimer = window.setTimeout(finish, 1120);
  }, 2650);
  fallbackTimer = window.setTimeout(finish, 5200);
  window.addEventListener('resize', reposition, { passive: true });
  window.visualViewport?.addEventListener('resize', reposition, { passive: true });
  reduceMotion.addEventListener?.('change', onMotionChange);
})();
