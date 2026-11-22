(() => {
  const dialog = document.getElementById('florimRequestDialog');
  if (!dialog) return;
  const form = dialog.querySelector('[data-contact-form]');
  const closeButton = dialog.querySelector('.florim-request-dialog__close');
  const requestTypes = [...form.querySelectorAll('[name="requestType"]')];
  let lastTrigger = null;
  let selectedType = '';

  const currentType = () => requestTypes.find(field => field.checked)?.value || selectedType;

  const updateEmailFallback = () => {
    const emailLink = form.querySelector('#formFeedback a[href^="mailto:"]');
    const type = currentType();
    if (!emailLink || !type) return;
    const value = name => form.elements.namedItem(name)?.value.trim() || '';
    const body = [
      `Talep t\u00fcr\u00fc: ${type}`,
      `Ad soyad: ${value('firstName')} ${value('lastName')}`.trim(),
      `E-posta: ${value('email')}`,
      `Telefon: ${value('phone')}`,
      `Firma: ${value('company')}`,
      `\u00dcr\u00fcn / koleksiyon: ${value('product')}`,
      `A\u00e7\u0131klama: ${value('message')}`,
    ].join('\n');
    emailLink.href = `mailto:info@bekamar.com?subject=${encodeURIComponent(`Florim - ${type}`)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener('input', updateEmailFallback);
  form.addEventListener('change', updateEmailFallback);

  document.querySelectorAll('[data-request-type]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      selectedType = trigger.dataset.requestType;
      requestTypes.forEach((field) => { field.checked = field.value === selectedType; });
      form.elements.namedItem('topic').value = 'Katalog / Numune talebi';
      form.elements.namedItem('message').value = selectedType === 'Katalog talebi'
        ? 'Florim koleksiyon katalo\u011fu talep ediyorum.'
        : selectedType === 'Numune talebi'
          ? 'Florim \u00fcr\u00fcn numunesi talep ediyorum. \u0130lgilendi\u011fim koleksiyon / \u00fcr\u00fcn: '
          : 'Florim koleksiyon katalo\u011fu ve \u00fcr\u00fcn numunesi talep ediyorum.';
      updateEmailFallback();
      dialog.showModal();
      form.elements.namedItem('firstName').focus();
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (lastTrigger?.isConnected) lastTrigger.focus();
  });
})();
