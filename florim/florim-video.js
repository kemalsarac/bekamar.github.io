(() => {
  const player = document.querySelector('.florim-rinascenza-film__player');
  if (!player) return;

  const video = player.querySelector('video');
  const toggle = player.querySelector('.florim-rinascenza-film__toggle');
  if (!video || !toggle) return;

  let pausedByUser = false;

  const syncToggle = () => {
    const playing = !video.paused;
    toggle.textContent = playing ? 'Duraklat' : 'Oynat';
    toggle.setAttribute('aria-label', playing ? 'Videoyu duraklat' : 'Videoyu oynat');
    toggle.setAttribute('aria-pressed', String(playing));
  };

  toggle.addEventListener('click', () => {
    if (video.paused) {
      pausedByUser = false;
      video.play().catch(() => syncToggle());
    } else {
      pausedByUser = true;
      video.pause();
    }
  });

  video.addEventListener('play', syncToggle);
  video.addEventListener('pause', syncToggle);
  syncToggle();

  if ('IntersectionObserver' in window) {
    const section = player.closest('.florim-new-collections');
    if (section) {
      section.classList.add('is-reveal-ready');
      const revealObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add('is-revealed');
        revealObserver.disconnect();
      }, { threshold: 0.12 });
      revealObserver.observe(section);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !pausedByUser) {
        video.play().catch(() => syncToggle());
      } else if (!entry.isIntersecting) {
        pausedByUser = false;
        video.pause();
      }
    }, { threshold: 0.45 });

    observer.observe(player);
  }
})();
