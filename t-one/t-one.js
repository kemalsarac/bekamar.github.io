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
  const catalogBrand = document.body.dataset.catalogBrand || 'T-One';
  const productNoun = document.body.dataset.productNoun || 'yüzey';
  const productsUrl = document.body.dataset.catalogProducts || '../assets/optimized/tone/products.json';
  const emptyMessage = document.body.dataset.emptyMessage || '';
  const catalogRequestUrl = document.body.dataset.catalogRequestUrl || '../bize-ulasin/index.html';
  const baseTitle = document.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const baseDescription = descriptionMeta?.content || '';
  const assetUrl = path => `../${path.split('/').map(encodeURIComponent).join('/')}`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr-TR').trim();
  let products = [];
  let catalogDocuments = [];
  let currentPage = 1;
  let activeSlug = '';

  function visibleProducts() {
    const query = normalize(search.value);
    return query ? products.filter(product => normalize(`${product.name} ${product.collection || ''}`).includes(query)) : products;
  }

  function cardMarkup(product) {
    const image = product.mainImage;
    const cardSrcset = image.smallThumbnail && image.thumbnail && image.smallThumbnail !== image.thumbnail
      ? `srcset="${assetUrl(image.smallThumbnail)} ${image.smallThumbnailWidth}w, ${assetUrl(image.thumbnail)} ${image.thumbnailWidth}w"`
      : '';
    return `<a class="tone-product-card" href="?urun=${encodeURIComponent(product.slug)}" data-product-link="${escapeHtml(product.slug)}" aria-label="${escapeHtml(product.name)} ürününü incele">
      <span class="tone-product-card__image"><img src="${assetUrl(image.thumbnail)}" ${cardSrcset} sizes="${escapeHtml(image.sizes || '(max-width: 680px) 46vw, 22vw')}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.name)} ${escapeHtml(productNoun)} dokusu" loading="lazy" decoding="async"></span>
      <span class="tone-product-card__meta"><span class="tone-product-card__name">${escapeHtml(product.name)}${product.collection ? `<small class="tone-product-card__collection">${escapeHtml(product.collection)}</small>` : ''}</span><span class="tone-product-card__link">İncele&nbsp; ↗</span></span>
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
    document.title = `${product.name} | ${catalogBrand} | BEKAMAR`;
    if (descriptionMeta) descriptionMeta.content = `${catalogBrand} ${product.name} ${productNoun}, teknik bilgileri ve mevcut görselleri. Bekamar'dan güncel bilgi alın.`;

    const image = product.mainImage;
    const applications = product.applications || [];
    const productIndex = products.findIndex(item => item.slug === product.slug);
    const otherProducts = products.slice(productIndex + 1, productIndex + 5).length
      ? products.slice(productIndex + 1, productIndex + 5)
      : products.slice(Math.max(0, productIndex - 4), productIndex);
    const galleryMarkup = applications.length
      ? `<div class="tone-detail__gallery${applications.length === 1 ? ' tone-detail__gallery--single' : ''}" aria-label="${escapeHtml(product.name)} mekân uygulamaları">${applications.map((application, index) => `<button type="button" data-lightbox-kind="application" data-image-index="${index}" aria-label="${escapeHtml(product.name)} mekân görselini büyüt"><img src="${assetUrl(application.thumbnail)}" width="${application.thumbnailWidth}" height="${application.thumbnailHeight}" alt="${escapeHtml(product.name)} taşının mekân uygulaması" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : (catalogBrand === 'T-One' ? '<p class="tone-detail__no-gallery">Bu ürün için uygulama görselleri henüz eklenmedi.</p>' : '');

    const specifications = Object.entries(product.specifications || {})
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
      .map(([label, value]) => catalogBrand === 'T-One'
        ? `<span>${escapeHtml(value)}</span>`
        : `<span>${escapeHtml(({dimensions: 'Ebat', thickness: 'Kalınlık', surface: 'Yüzey', size: 'Ölçü'})[label] || label)}: ${escapeHtml(value)}</span>`).join('');
    const descriptionMarkup = product.description
      ? `<p>${escapeHtml(product.description)}</p>`
      : (catalogBrand === 'T-One' ? '<p>Yüzey ve proje bilgisi için Bekamar ekibinden güncel bilgi alın.</p>' : '');
    const collectionMarkup = product.collection ? `<p class="tone-detail__collection">${escapeHtml(product.collection)}</p>` : '';
    const applicationsMarkup = applications.length
      ? `<div class="tone-detail__applications"><p class="eyebrow">Mekân uygulamaları</p>${galleryMarkup}</div>`
      : '';
    detail.innerHTML = `<div class="tone-detail__layout">
      <button class="tone-detail__image-button" type="button" data-lightbox-kind="product" aria-label="${escapeHtml(product.name)} görselini büyüt" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in">
        <img class="tone-detail__main" src="${assetUrl(image.thumbnail)}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.name)} ${escapeHtml(productNoun)} dokusu" decoding="async">
      </button>
      <div class="tone-detail__copy"><p class="eyebrow">${escapeHtml(catalogBrand)} / Ürün detayı</p><h3 tabindex="-1">${escapeHtml(product.name)}</h3>${collectionMarkup}${descriptionMarkup}${specifications ? `<div class="tone-detail__specs">${specifications}</div>` : ''}<div class="tone-detail__actions"><button type="button" data-close-detail>← Koleksiyona dön</button><a href="../bize-ulasin/index.html?urun=${encodeURIComponent(product.slug)}">Teklif ve bilgi al ↗</a></div>${applicationsMarkup}</div></div>
    <div class="tone-detail__similar"><h4>Koleksiyondan diğer yüzeyler</h4><div class="tone-detail__similar-links">${otherProducts.map(item => `<a href="?urun=${encodeURIComponent(item.slug)}" data-product-link="${escapeHtml(item.slug)}">${escapeHtml(item.name)} ↗</a>`).join('')}</div></div>`;
    detail.hidden = false;
  }

  function render() {
    const filtered = visibleProducts();
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), pageCount);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageProducts = filtered.slice(start, start + PAGE_SIZE);
    const toolbar = document.querySelector('.tone-catalog__toolbar');
    if (toolbar) toolbar.hidden = products.length === 0 && Boolean(emptyMessage);
    count.textContent = `${filtered.length} ürün${search.value ? ' bulundu' : ''}`;
    grid.classList.toggle('tone-product-grid--empty', products.length === 0);
    grid.innerHTML = pageProducts.length
      ? pageProducts.map(cardMarkup).join('')
      : products.length === 0 && emptyMessage
        ? `<div class="tone-catalog__empty-state"><p>${escapeHtml(emptyMessage)}</p><a href="${escapeHtml(catalogRequestUrl)}">Koleksiyon hakkında bilgi alın ↗</a></div>`
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
      : `${product.name} ${productNoun} görseli`;
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

  fetch(productsUrl)
    .then(response => { if (!response.ok) throw new Error('Catalog data unavailable'); return response.json(); })
    .then(data => {
      products = data.products;
      catalogDocuments = data.catalogs || [];
      const catalogLink = document.getElementById(document.body.dataset.catalogLinksId || 'florimCatalogLinks');
      if (catalogLink) {
        catalogLink.innerHTML = catalogDocuments.length
          ? catalogDocuments.map(catalog => `<a class="catalog-document" href="${assetUrl(catalog.file)}" target="_blank" rel="noopener" aria-label="${escapeHtml(catalog.title)} katalogunu ac">${catalog.preview ? `<img src="${assetUrl(catalog.preview)}" alt="${escapeHtml(catalog.title)} cover" loading="eager" fetchpriority="high" decoding="async">` : ''}<span>KATALOĞU AÇ <b aria-hidden="true">&rarr;</b></span></a>`).join('')
          : `<a href="${escapeHtml(catalogRequestUrl)}">${escapeHtml(catalogBrand)} kataloğunu talep edin ↗</a>`;
      }
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
