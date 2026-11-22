(() => {
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
