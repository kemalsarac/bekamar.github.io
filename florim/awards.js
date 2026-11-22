(() => {
  const viewport = document.querySelector('[data-award-viewport]');
  if (!viewport) return;
  const cards = [...viewport.querySelectorAll('.florim-award-card')];
  const prev = document.querySelector('[data-award-prev]');
  const next = document.querySelector('[data-award-next]');
  const current = document.querySelector('[data-award-current]');
  const progress = document.querySelector('[data-award-progress]');
  const progressbar = document.querySelector('.florim-awards__progress');
  let active = 0;
  let pointerStart = null;
  let dragged = false;
  let suppressClick = false;
  let settleTimer;

  const renderIndex = () => {
    const left = viewport.scrollLeft;
    const viewportLeft = viewport.getBoundingClientRect().left;
    active = cards.reduce((best, card, index) => {
      const start = card.getBoundingClientRect().left - viewportLeft + left;
      const bestStart = cards[best].getBoundingClientRect().left - viewportLeft + left;
      return Math.abs(start - left) < Math.abs(bestStart - left) ? index : best;
    }, 0);
    current.textContent = String(active + 1).padStart(2, '0');
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
    progress.style.transform = `translateX(${active * 100}%)`;
    progressbar.setAttribute('aria-valuenow', String(active + 1));
  };
  const go = (index) => {
    const bounded = Math.max(0, Math.min(cards.length - 1, index));
    viewport.scrollTo({ left: cards[bounded].getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    active = bounded;
    current.textContent = String(active + 1).padStart(2, '0');
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
    progress.style.transform = `translateX(${active * 100}%)`;
    progressbar.setAttribute('aria-valuenow', String(active + 1));
  };
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  viewport.addEventListener('scroll', () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(renderIndex, 70);
  }, { passive: true });
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1); }
    if (event.key === 'Home') { event.preventDefault(); go(0); }
    if (event.key === 'End') { event.preventDefault(); go(cards.length - 1); }
  });
  viewport.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && viewport.scrollWidth > viewport.clientWidth) {
      viewport.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }, { passive: false });
  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointerStart = { x: event.clientX, left: viewport.scrollLeft, pointerId: event.pointerId };
    dragged = false;
  });
  document.addEventListener('pointermove', (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    const delta = event.clientX - pointerStart.x;
    if (Math.abs(delta) > 5) {
      dragged = true;
      viewport.classList.add('is-dragging');
      viewport.scrollLeft = pointerStart.left - delta;
    }
  });
  const endDrag = () => {
    if (!pointerStart) return;
    pointerStart = null;
    viewport.classList.remove('is-dragging');
    if (dragged) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
      renderIndex();
    }
  };
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', (event) => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  window.addEventListener('resize', renderIndex, { passive: true });
  renderIndex();
})();

