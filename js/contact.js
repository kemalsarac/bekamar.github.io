(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');
  const submitButton = form.querySelector('button[type="submit"]');
  const config = window.BEKAMAR_CONTACT_CONFIG || {};
  const endpoint = typeof config.apiUrl === 'string' ? config.apiUrl.trim() : '';
  const siteKey = typeof config.turnstileSiteKey === 'string' ? config.turnstileSiteKey.trim() : '';
  const turnstileContainer = form.querySelector('[data-contact-turnstile]');
  const params = new URLSearchParams(window.location.search);
  const requestedStone = params.get('urun')?.trim().slice(0, 100);
  if (params.get('konu') === 'granit' && requestedStone) {
    form.elements.namedItem('topic').value = 'Doğal taş ürünleri';
    form.elements.namedItem('message').value = `Granit ürünü hakkında bilgi almak istiyorum: ${requestedStone}`;
  }
  if (params.get('konu') === 'florim') {
    form.elements.namedItem('topic').value = 'Proje ve fiyat teklifi';
    form.elements.namedItem('message').value = `Florim ${params.get('urun')?.trim().slice(0, 100) || 'koleksiyonları'} için fiyat teklifi almak istiyorum.`;
  }
  const requestedBrand = params.get('marka')?.trim().slice(0, 40) || '';
  const requestedProduct = params.get('urun')?.trim().slice(0, 100) || '';
  if (requestedProduct && ['T-One', 'Kale', 'Kalebodur'].includes(requestedBrand)) {
    form.elements.namedItem('topic').value = 'Proje ve fiyat teklifi';
    form.elements.namedItem('message').value = requestedBrand + ' ' + requestedProduct + ' ürünü hakkında bilgi ve teklif almak istiyorum.';
  }
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
    setState('error', 'G\u00fcvenli form g\u00f6nderimi hen\u00fcz etkin de\u011fil. Talebinizi e-posta uygulaman\u0131zda a\u00e7\u0131n: ');
    const fallback = document.createElement('a');
    fallback.href = 'mailto:info@bekamar.com';
    fallback.textContent = 'E-posta tasla\u011f\u0131 olu\u015ftur';
    feedback.append(fallback, document.createTextNode(' ba\u011flant\u0131s\u0131n\u0131 kullanabilirsiniz.'));
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

    const structured = Boolean(form.elements.namedItem('firstName') && form.elements.namedItem('lastName'));
    const fields = (structured ? ['firstName', 'lastName', 'email', 'phone'] : ['name', 'email', 'topic', 'message']).map(name => form.elements.namedItem(name));
    const validPhone = value => /^[+()\d\s.-]{7,40}$/.test(value) && (value.match(/\d/g) || []).length >= 7;
    const requestTypeInputs = [...form.querySelectorAll('[name="requestType"]')];
    const requestTypes = requestTypeInputs.filter(field => field.checked).map(field => field.value);
    if (requestTypeInputs.length && !requestTypes.length) {
      setState('error', 'En az bir talep t\u00fcr\u00fc se\u00e7in.');
      requestTypeInputs[0].focus();
      return;
    }
    const invalid = fields.filter(field => {
      const value = field.value.trim();
      return !value || ((field.name === 'name' || field.name === 'message' || field.name === 'firstName' || field.name === 'lastName') && value.length < 2) || (field.type === 'email' && !field.validity.valid) || (field.type === 'tel' && !validPhone(value));
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(error => { error.textContent = ''; });
    if (invalid.length) {
      for (const field of invalid) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.name}-error`);
        if (error) error.textContent = field.type === 'email' ? 'Ge\u00e7erli bir e-posta adresi girin.' : field.type === 'tel' && !validPhone(field.value.trim()) ? 'En az 7 rakam i\u00e7eren ge\u00e7erli bir telefon girin.' : (field.name === 'name' || field.name === 'message' || field.name === 'firstName' || field.name === 'lastName') && field.value.trim().length < 2 ? 'En az iki karakter girin.' : 'Bu alan\u0131 doldurun.';
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
          name: structured ? `${form.elements.namedItem('firstName').value.trim()} ${form.elements.namedItem('lastName').value.trim()}` : form.elements.namedItem('name').value,
          email: form.elements.namedItem('email').value,
          phone: form.elements.namedItem('phone')?.value || '',
          topic: form.elements.namedItem('topic').value,
          message: form.elements.namedItem('message')?.value.trim() || (structured ? 'Katalog / numune talebi' : ''),
          company: form.elements.namedItem('company')?.value || '',
          product: form.elements.namedItem('product')?.value || '',
          requestType: requestTypes.join(', '),
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
