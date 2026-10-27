const unitDialog = document.getElementById('unitDialog');
if (unitDialog) {
  const openButtons = document.querySelectorAll('[data-open-profile]');
  const closeButton = unitDialog.querySelector('[data-close-profile]');
  let lastOpener = null;

  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      lastOpener = button;
      if (typeof unitDialog.showModal === 'function') unitDialog.showModal();
      else unitDialog.setAttribute('open', '');
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener('click', () => unitDialog.close());
  unitDialog.addEventListener('click', event => {
    if (event.target === unitDialog) unitDialog.close();
  });
  unitDialog.addEventListener('close', () => lastOpener?.focus());
}
