(() => {
  document.querySelector('.applications-editorial').addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;

    event.preventDefault();
    history.replaceState(history.state, '', link.hash);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  });

  const features = document.querySelectorAll('.application-feature');
  if (!('IntersectionObserver' in window)) {
    features.forEach(feature => feature.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -5% 0px'});
  features.forEach(feature => observer.observe(feature));
})();
