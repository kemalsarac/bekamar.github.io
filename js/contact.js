(() => {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  const storageKey = 'bekamarContactDraft';
  const submitButton = form.querySelector('button[type="submit"]');
  let restoring = true;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      Object.entries(saved).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (field && typeof value === 'string') field.value = value;
      });
    }
  } catch {}
  restoring = false;

  form.addEventListener('input', () => {
    if (restoring) return;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.namedItem('name');
    const email = form.elements.namedItem('email');
    const message = form.elements.namedItem('message');
    const invalid = [];
    [[name, 'Ad Soyad alanını doldurun.'], [email, 'Geçerli bir e-posta adresi girin.'], [message, 'Mesajınızı yazın.']].forEach(([field, text]) => {
      const error = document.getElementById(`${field.name}-error`);
      const bad = !field.value.trim() || (field.type === 'email' && !field.validity.valid);
      field.setAttribute('aria-invalid', String(bad));
      if (error) error.textContent = bad ? text : '';
      if (bad) invalid.push(field);
    });
    if (invalid.length) {
      feedback.textContent = 'Lütfen işaretli alanları kontrol edin.';
      invalid[0].focus();
      return;
    }

    const topic = form.elements.namedItem('topic').value;
    const phone = form.elements.namedItem('phone').value.trim();
    const body = [
      `Ad Soyad: ${name.value.trim()}`,
      `E-posta: ${email.value.trim()}`,
      `Telefon: ${phone || 'Belirtilmedi'}`,
      `Konu: ${topic}`,
      '',
      'Mesaj:',
      message.value.trim()
    ].join('\n');
    const mailto = `mailto:info@bekamar.com?subject=${encodeURIComponent(`Bekamar iletişim talebi: ${topic}`)}&body=${encodeURIComponent(body)}`;
    feedback.replaceChildren(document.createTextNode('E-posta taslağı açılıyor. Gönderimi e-posta uygulamanızda tamamlayın. '));
    const fallback = document.createElement('a');
    fallback.href = mailto;
    fallback.textContent = 'Taslağı yeniden aç';
    feedback.append(fallback);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.querySelector('span:first-child').textContent = 'E-posta uygulaması açılıyor';
      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.querySelector('span:first-child').textContent = 'Mesajınızı gönderin';
      }, 1600);
    }
    window.location.href = mailto;
  });
})();
