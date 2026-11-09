(() => {
  const videos = [...document.querySelectorAll('video[data-hero-video]')];
  if (!videos.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  // Keep the lightweight poster for users who requested reduced motion or data use.
  if (reducedMotion.matches || saveData) return;
  const loadVideo = video => {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    video.preload = 'auto';
    video.load();
    video.play().catch(() => {
      // The poster remains a useful hero fallback when autoplay is unavailable.
      video.classList.add('is-unavailable');
    });
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
