document.addEventListener('click', event => {
  const button = event.target.closest('[data-map-load]');
  if (!button) return;
  const frame = document.createElement('iframe');
  frame.title = button.dataset.mapTitle || 'Google Maps';
  frame.src = button.dataset.mapSrc;
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  frame.allowFullscreen = true;
  button.replaceWith(frame);
});
