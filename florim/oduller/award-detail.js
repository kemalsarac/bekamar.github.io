(() => {
  const dialog = document.querySelector('.award-lightbox');
  if (!dialog) return;
  const image = dialog.querySelector('img');
  const closeButton = dialog.querySelector('.award-lightbox__close');
  let lastTrigger = null;

  document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      image.src = trigger.dataset.lightboxSrc;
      image.alt = trigger.dataset.lightboxAlt || '';
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    if (lastTrigger?.isConnected) lastTrigger.focus();
  });
})();
