const revealTargets = document.querySelectorAll('[data-reveal]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const materialVideos = document.querySelectorAll('.material-tile video');
function syncMaterialVideoMotion() {
  materialVideos.forEach(video => {
    if (reduceMotion.matches) video.pause();
    else video.play().catch(() => {});
  });
}
syncMaterialVideoMotion();
if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncMaterialVideoMotion);
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  document.body.classList.add('reveal-enabled');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(target => revealObserver.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add('is-visible'));
}

const stonePhotoStack = document.querySelector('.composite-images');
if (stonePhotoStack) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    stonePhotoStack.classList.add('is-open');
  } else {
    const photoStackObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        stonePhotoStack.classList.toggle('is-open', entry.isIntersecting && entry.intersectionRatio >= 0.2);
      });
    }, { threshold: [0, 0.2] });
    photoStackObserver.observe(stonePhotoStack);
  }
}

(() => {
  const gallery = document.getElementById('branchGallery');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('.branch-gallery__slide')];
  const previous = gallery.querySelector('[data-gallery-direction="previous"]');
  const next = gallery.querySelector('[data-gallery-direction="next"]');
  const counter = gallery.querySelector('.branch-gallery__count');
  if (slides.length < 2 || !previous || !next || !counter) return;

  let activeIndex = 0;
  let timer = null;
  let isVisible = !('IntersectionObserver' in window);

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    const current = String(activeIndex + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');
    counter.innerHTML = `${current} <i>/</i> ${total}`;
  }

  function stopTimer() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function syncTimer() {
    stopTimer();
    if (!gallery.isConnected || !isVisible || document.hidden || reduceMotion.matches) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 4500);
  }

  const onPrevious = () => { showSlide(activeIndex - 1); syncTimer(); };
  const onNext = () => { showSlide(activeIndex + 1); syncTimer(); };
  const onVisibilityChange = () => syncTimer();
  const onMotionChange = () => syncTimer();
  const onMouseEnter = () => stopTimer();
  const onMouseLeave = () => { if (!gallery.contains(document.activeElement)) syncTimer(); };
  const onFocusIn = () => stopTimer();
  const onFocusOut = event => { if (!gallery.contains(event.relatedTarget)) syncTimer(); };

  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  gallery.addEventListener('mouseenter', onMouseEnter);
  gallery.addEventListener('mouseleave', onMouseLeave);
  gallery.addEventListener('focusin', onFocusIn);
  gallery.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);

  let visibilityObserver;
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(entries => {
      isVisible = entries.some(entry => entry.isIntersecting);
      syncTimer();
    }, { threshold: 0.05 });
    visibilityObserver.observe(gallery);
  }

  let removalObserver;
  function cleanup() {
    stopTimer();
    visibilityObserver?.disconnect();
    removalObserver?.disconnect();
    previous.removeEventListener('click', onPrevious);
    next.removeEventListener('click', onNext);
    gallery.removeEventListener('mouseenter', onMouseEnter);
    gallery.removeEventListener('mouseleave', onMouseLeave);
    gallery.removeEventListener('focusin', onFocusIn);
    gallery.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (reduceMotion.removeEventListener) reduceMotion.removeEventListener('change', onMotionChange);
    window.removeEventListener('pagehide', cleanup);
  }

  if ('MutationObserver' in window) {
    removalObserver = new MutationObserver(() => {
      if (!gallery.isConnected) cleanup();
    });
    removalObserver.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener('pagehide', cleanup, { once: true });
  showSlide(0);
  syncTimer();
})();

const companyContactForm = document.getElementById('companyContactForm');
if (companyContactForm) {
  companyContactForm.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = document.getElementById('contactFormFeedback');
    if (!companyContactForm.reportValidity() || !feedback) return;
    feedback.textContent = 'Mesaj bu sayfadan gönderilmedi. Lütfen Bekamar’ın resmi iletişim sayfasını kullanın.';
  });
}
