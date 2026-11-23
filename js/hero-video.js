(() => {
  const videos = [...document.querySelectorAll('video[data-hero-video]')];
  if (!videos.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  // Leave the hero background visible when motion or data use is limited.
  if (reducedMotion.matches || saveData) return;
  const loadVideo = video => {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    video.preload = 'auto';
    video.load();
    video.play().then(() => {
      video.classList.add('is-playing');
    }).catch(() => {
      // Keep the hero background visible if playback cannot start.
    });
  };
  if (!('IntersectionObserver' in window)) {
    videos.forEach(video => setTimeout(() => loadVideo(video), 120));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    loadVideo(entry.target);
  }), {rootMargin: '120px'});
  videos.forEach(video => observer.observe(video));
})();
