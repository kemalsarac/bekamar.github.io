(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');
  const submitButton = form.querySelector('button[type="submit"]');
  const config = window.BEKAMAR_CONTACT_CONFIG || {};
  const endpoint = typeof config.apiUrl === 'string' ? config.apiUrl.trim() : '';
  const siteKey = typeof config.turnstileSiteKey === 'string' ? config.turnstileSiteKey.trim() : '';
  const turnstileContainer = form.querySelector('[data-contact-turnstile]');
  let widgetId = null;
  let token = '';
  let turnstileReady = false;

  const setState = (state, message = '') => {
    form.dataset.state = state;
    feedback.dataset.state = state;
    feedback.replaceChildren();
    if (message) feedback.append(document.createTextNode(message));
  };

  if (!endpoint || !siteKey) {
    setState('error', 'Form g\u00f6nderimi ge\u00e7ici olarak kullan\u0131lam\u0131yor. E-posta ile ula\u015fmak i\u00e7in ');
    const fallback = document.createElement('a');
    fallback.href = 'mailto:info@bekamar.com';
    fallback.textContent = 'info@bekamar.com';
    feedback.append(fallback, document.createTextNode(' adresini kullanabilirsiniz.'));
    submitButton.disabled = true;
    return;
  }

  const loadTurnstile = () => {
    if (!window.turnstile || !turnstileContainer || widgetId !== null) return;
    turnstileContainer.hidden = false;
    widgetId = window.turnstile.render(turnstileContainer, {
      sitekey: siteKey,
      action: 'contact',
      callback: value => { token = value; turnstileReady = true; submitButton.disabled = false; setState('idle'); },
      'expired-callback': () => { token = ''; turnstileReady = false; submitButton.disabled = true; setState('error', 'G\u00fcvenlik do\u011frulamas\u0131n\u0131 yenileyin.'); },
      'error-callback': () => { token = ''; turnstileReady = false; submitButton.disabled = true; setState('error', 'G\u00fcvenlik do\u011frulamas\u0131 y\u00fcklenemedi. L\u00fctfen daha sonra tekrar deneyin.'); },
    });
  };

  submitButton.disabled = true;
  window.onBekamarTurnstileReady = loadTurnstile;
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onBekamarTurnstileReady&render=explicit';
  script.async = true;
  script.defer = true;
  script.onerror = () => setState('error', 'G\u00fcvenlik do\u011frulamas\u0131 y\u00fcklenemedi. L\u00fctfen daha sonra tekrar deneyin.');
  document.head.append(script);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!turnstileReady || !token) {
      setState('error', 'L\u00fctfen g\u00fcvenlik do\u011frulamas\u0131n\u0131 tamamlay\u0131n.');
      return;
    }

    const fields = ['name', 'email', 'topic', 'message'].map(name => form.elements.namedItem(name));
    const invalid = fields.filter(field => {
      const value = field.value.trim();
      return !value || ((field.name === 'name' || field.name === 'message') && value.length < 2) || (field.type === 'email' && !field.validity.valid);
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(error => { error.textContent = ''; });
    if (invalid.length) {
      for (const field of invalid) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.name}-error`);
        if (error) error.textContent = field.type === 'email' ? 'Ge\u00e7erli bir e-posta adresi girin.' : (field.name === 'name' || field.name === 'message') && field.value.trim().length < 2 ? 'En az iki karakter girin.' : 'Bu alan\u0131 doldurun.';
      }
      setState('error', 'L\u00fctfen i\u015faretli alanlar\u0131 kontrol edin.');
      invalid[0].focus();
      return;
    }

    submitButton.disabled = true;
    setState('loading', 'Mesaj\u0131n\u0131z g\u00f6nderiliyor\u2026');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.elements.namedItem('name').value,
          email: form.elements.namedItem('email').value,
          phone: form.elements.namedItem('phone').value,
          topic: form.elements.namedItem('topic').value,
          message: form.elements.namedItem('message').value,
          turnstileToken: token,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        const messages = {
          verification_failed: 'G\u00fcvenlik do\u011frulamas\u0131 ba\u015far\u0131s\u0131z. L\u00fctfen yeniden deneyin.',
          rate_limited: 'K\u0131sa s\u00fcrede \u00e7ok fazla deneme yap\u0131ld\u0131. Biraz bekleyip yeniden deneyin.',
          temporarily_unavailable: 'Form g\u00f6nderimi ge\u00e7ici olarak kullan\u0131lam\u0131yor.',
          email_unavailable: 'Mesaj\u0131n\u0131z g\u00f6nderilemedi. L\u00fctfen e-posta ile ula\u015f\u0131n.',
        };
        throw new Error(messages[result?.error] || 'Mesaj\u0131n\u0131z g\u00f6nderilemedi. L\u00fctfen yeniden deneyin.');
      }
      setState('success', 'Mesaj\u0131n\u0131z Bekamar ekibine iletildi.');
      form.reset();
    } catch (error) {
      setState('error', error instanceof TypeError ? 'Sunucuya ula\u015f\u0131lamad\u0131. L\u00fctfen yeniden deneyin veya e-posta ile ula\u015f\u0131n.' : error.message);
    } finally {
      token = '';
      turnstileReady = false;
      if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
      submitButton.disabled = true;
    }
  });
})();
