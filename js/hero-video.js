(() => {
  const videos = [...document.querySelectorAll('video[data-hero-video]')];
  if (!videos.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileOrDataSaver = matchMedia('(max-width: 760px)').matches || navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  if (reducedMotion.matches || mobileOrDataSaver) return;
  const loadVideo = video => {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    video.preload = 'auto';
    video.load();
    video.play().catch(() => video.classList.add('is-unavailable'));
  };
  if (!('IntersectionObserver' in window)) {
    videos.forEach(video => setTimeout(() => loadVideo(video), 900));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const schedule = window.requestIdleCallback || (callback => setTimeout(callback, 700));
    schedule(() => { if (entry.target.isConnected) loadVideo(entry.target); }, {timeout: 1800});
  }), {rootMargin: '120px'});
  videos.forEach(video => observer.observe(video));
})();
