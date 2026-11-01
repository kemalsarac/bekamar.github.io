(() => {
  const grid = document.getElementById('toneProductGrid');
  const search = document.getElementById('toneSearch');
  const count = document.getElementById('toneCount');
  const pagination = document.getElementById('tonePagination');
  const pageStatus = document.getElementById('tonePageStatus');
  const detail = document.getElementById('toneDetail');
  const error = document.getElementById('toneError');
  const lightbox = document.getElementById('toneLightbox');
  const lightboxContent = document.getElementById('toneLightboxContent');
  const lightboxCaption = document.getElementById('toneLightboxCaption');
  if (!grid || !search || !count || !pagination || !detail || !lightbox) return;

  const PAGE_SIZE = 12;
  const baseTitle = document.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const baseDescription = descriptionMeta?.content || '';
  const assetUrl = path => `../${path.split('/').map(encodeURIComponent).join('/')}`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr-TR').trim();
  let products = [];
  let currentPage = 1;
  let activeSlug = '';

  function visibleProducts() {
    const query = normalize(search.value);
    return query ? products.filter(product => normalize(product.name).includes(query)) : products;
  }

  function cardMarkup(product) {
    const image = product.mainImage;
    const cardSrcset = `${assetUrl(image.smallThumbnail)} ${image.smallThumbnailWidth}w, ${assetUrl(image.thumbnail)} ${image.thumbnailWidth}w`;
    return `<a class="tone-product-card" href="?urun=${encodeURIComponent(product.slug)}" data-product-link="${escapeHtml(product.slug)}" aria-label="${escapeHtml(product.name)} ürününü incele">
      <span class="tone-product-card__image"><img src="${assetUrl(image.thumbnail)}" srcset="${cardSrcset}" sizes="${escapeHtml(image.sizes)}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.name)} T-One yüzey dokusu" loading="lazy" decoding="async"></span>
      <span class="tone-product-card__meta"><span class="tone-product-card__name">${escapeHtml(product.name)}</span><span class="tone-product-card__link">İncele&nbsp; ↗</span></span>
    </a>`;
  }

  function updateUrl({ push = false } = {}) {
    const url = new URL(window.location.href);
    if (activeSlug) url.searchParams.set('urun', activeSlug);
    else url.searchParams.delete('urun');
    if (currentPage > 1) url.searchParams.set('sayfa', String(currentPage));
    else url.searchParams.delete('sayfa');
    const method = push ? 'pushState' : 'replaceState';
    window.history[method]({}, '', url);
  }

  function renderDetail() {
    const product = products.find(item => item.slug === activeSlug);
    if (!product) {
      activeSlug = '';
      detail.hidden = true;
      detail.innerHTML = '';
      document.title = baseTitle;
      if (descriptionMeta) descriptionMeta.content = baseDescription;
      return;
    }
    document.title = `${product.name} | T-One | BEKAMAR`;
    if (descriptionMeta) descriptionMeta.content = `T-One ${product.name} yüzeyi, teknik ölçüleri ve mekân uygulamaları. Bekamar'dan bilgi alın.`;

    const image = product.mainImage;
    const applications = product.applications || [];
    const productIndex = products.findIndex(item => item.slug === product.slug);
    const otherProducts = products.slice(productIndex + 1, productIndex + 5).length
      ? products.slice(productIndex + 1, productIndex + 5)
      : products.slice(Math.max(0, productIndex - 4), productIndex);
    const galleryMarkup = applications.length
      ? `<div class="tone-detail__gallery${applications.length === 1 ? ' tone-detail__gallery--single' : ''}" aria-label="${escapeHtml(product.name)} mekân uygulamaları">${applications.map((application, index) => `<button type="button" data-lightbox-kind="application" data-image-index="${index}" aria-label="${escapeHtml(product.name)} mekân görselini büyüt"><img src="${assetUrl(application.thumbnail)}" width="${application.thumbnailWidth}" height="${application.thumbnailHeight}" alt="${escapeHtml(product.name)} taşının mekân uygulaması" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : '<p class="tone-detail__no-gallery">Bu ürün için uygulama görselleri henüz eklenmedi.</p>';

    detail.innerHTML = `<div class="tone-detail__layout">
      <button class="tone-detail__image-button" type="button" data-lightbox-kind="product" aria-label="${escapeHtml(product.name)} görselini büyüt" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in">
        <img class="tone-detail__main" src="${assetUrl(image.thumbnail)}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.name)} T-One yüzey dokusu" decoding="async">
      </button>
      <div class="tone-detail__copy"><p class="eyebrow">T-One / Ürün detayı</p><h3 tabindex="-1">${escapeHtml(product.name)}</h3><p>Yüzey ve proje bilgisi için Bekamar ekibinden güncel bilgi alın.</p><div class="tone-detail__specs"><span>${escapeHtml(product.specifications.dimensions)}</span><span>${escapeHtml(product.specifications.thickness)}</span></div><div class="tone-detail__actions"><button type="button" data-close-detail>← Koleksiyona dön</button><a href="../bize-ulasin/index.html?urun=${encodeURIComponent(product.slug)}">Teklif ve bilgi al ↗</a></div><div class="tone-detail__applications"><p class="eyebrow">Mekân uygulamaları</p>${galleryMarkup}</div></div></div>
    <div class="tone-detail__similar"><h4>Koleksiyondan diğer yüzeyler</h4><div class="tone-detail__similar-links">${otherProducts.map(item => `<a href="?urun=${encodeURIComponent(item.slug)}" data-product-link="${escapeHtml(item.slug)}">${escapeHtml(item.name)} ↗</a>`).join('')}</div></div>`;
    detail.hidden = false;
  }

  function render() {
    const filtered = visibleProducts();
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), pageCount);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageProducts = filtered.slice(start, start + PAGE_SIZE);
    count.textContent = `${filtered.length} ürün${search.value ? ' bulundu' : ''}`;
    grid.innerHTML = pageProducts.length
      ? pageProducts.map(cardMarkup).join('')
      : '<p class="tone-catalog__empty">Aramanızla eşleşen ürün bulunamadı.</p>';
    grid.setAttribute('aria-busy', 'false');
    pagination.hidden = pageCount <= 1;
    pageStatus.textContent = `${currentPage} / ${pageCount}`;
    pagination.querySelector('[data-page-step="-1"]').disabled = currentPage <= 1;
    pagination.querySelector('[data-page-step="1"]').disabled = currentPage >= pageCount;
    renderDetail();
  }

  function openLightbox(kind, index = 0) {
    const product = products.find(item => item.slug === activeSlug);
    if (!product) return;
    const image = kind === 'application' ? product.applications[index] : product.mainImage;
    if (!image) return;
    const alt = kind === 'application'
      ? `${product.name} taşının mekân uygulaması`
      : `${product.name} T-One yüzey görseli`;
    const avif = image.detailAvif
      ? `<source type="image/avif" srcset="${assetUrl(image.detailAvif)}">`
      : '';
    lightboxContent.innerHTML = `<picture>${avif}<img src="${assetUrl(image.detailWebp)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(alt)}" decoding="async"></picture>`;
    lightboxCaption.textContent = alt;
    lightbox.showModal();
  }

  grid.addEventListener('click', event => {
    const link = event.target.closest('[data-product-link]');
    if (!link) return;
    event.preventDefault();
    activeSlug = link.dataset.productLink;
    search.value = '';
    render();
    detail.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    detail.querySelector('h3')?.focus({ preventScroll: true });
    updateUrl({ push: true });
  });

  detail.addEventListener('click', event => {
    const link = event.target.closest('[data-product-link]');
    if (link) {
      event.preventDefault();
      activeSlug = link.dataset.productLink;
      render();
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      detail.querySelector('h3')?.focus({ preventScroll: true });
      updateUrl({ push: true });
      return;
    }
    if (event.target.closest('[data-close-detail]')) {
      activeSlug = '';
      render();
      updateUrl({ push: true });
      search.focus({ preventScroll: true });
      return;
    }
    const imageButton = event.target.closest('[data-lightbox-kind]');
    if (imageButton) openLightbox(imageButton.dataset.lightboxKind, Number(imageButton.dataset.imageIndex || 0));
  });

  pagination.addEventListener('click', event => {
    const button = event.target.closest('[data-page-step]');
    if (!button || button.disabled) return;
    currentPage += Number(button.dataset.pageStep);
    activeSlug = '';
    render();
    updateUrl({ push: true });
    document.getElementById('koleksiyon').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  search.addEventListener('input', () => {
    currentPage = 1;
    activeSlug = '';
    render();
    updateUrl();
  });

  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  window.addEventListener('popstate', () => {
    const url = new URL(window.location.href);
    activeSlug = url.searchParams.get('urun') || '';
    currentPage = Number(url.searchParams.get('sayfa') || 1);
    render();
  });

  fetch('../assets/optimized/tone/products.json')
    .then(response => { if (!response.ok) throw new Error('Catalog data unavailable'); return response.json(); })
    .then(data => {
      products = data.products;
      const url = new URL(window.location.href);
      activeSlug = url.searchParams.get('urun') || '';
      currentPage = Number(url.searchParams.get('sayfa') || 1);
      const activeIndex = products.findIndex(product => product.slug === activeSlug);
      if (activeIndex >= 0 && !url.searchParams.has('sayfa')) currentPage = Math.floor(activeIndex / PAGE_SIZE) + 1;
      render();
      updateUrl();
      if (activeSlug) requestAnimationFrame(() => detail.scrollIntoView({ behavior: 'auto', block: 'start' }));
    })
    .catch(() => {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '';
      count.textContent = 'Koleksiyon yüklenemedi';
      error.hidden = false;
    });
})();
