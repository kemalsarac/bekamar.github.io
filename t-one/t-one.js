(() => {
  const grid = document.getElementById('toneProductGrid');
  const search = document.getElementById('toneSearch');
  const count = document.getElementById('toneCount');
  const pagination = document.getElementById('tonePagination');
  let detail = document.getElementById('toneDetail');
  const error = document.getElementById('toneError');
  const lightbox = document.getElementById('toneLightbox');
  const lightboxContent = document.getElementById('toneLightboxContent');
  const lightboxCaption = document.getElementById('toneLightboxCaption');
  if (!grid || !search || !count || !pagination || !detail || !lightbox) return;
  if (!(detail instanceof HTMLDialogElement)) {
    const dialog = document.createElement('dialog');
    dialog.id = detail.id;
    dialog.className = detail.className;
    dialog.setAttribute('aria-live', 'polite');
    detail.replaceWith(dialog);
    detail = dialog;
  }
  detail.hidden = false;
  pagination.innerHTML = '<div class="tone-pagination__actions"><button class="tone-page-button" type="button" data-load-more>Daha fazlasını gör</button><button class="tone-page-button" type="button" data-show-less hidden>Daha azını gör</button></div><span id="tonePageStatus" aria-live="polite"></span>';
  const pageStatus = document.getElementById('tonePageStatus');

  const PAGE_SIZE = document.body.dataset.catalogBrand === 'Florim' ? 12 : 15;
  let catalogBrand = document.body.dataset.catalogBrand || 'T-One';
  let activeBrand = catalogBrand;
  if (catalogBrand === 'T-One') {
    activeBrand = new URL(window.location.href).searchParams.get('marka') || 'T-One';
    if (!['T-One', 'Kale', 'Kalebodur'].includes(activeBrand)) activeBrand = 'T-One';
  }
  const productNoun = document.body.dataset.productNoun || 'yüzey';
  const productsUrl = document.body.dataset.catalogProducts || '../assets/optimized/tone/products.json';
  const partnerProductsUrl = '../assets/optimized/kale/products.json';
  const emptyMessage = document.body.dataset.emptyMessage || '';
  const catalogRequestUrl = document.body.dataset.catalogRequestUrl || '../bize-ulasin/index.html';
  const baseTitle = document.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const baseDescription = descriptionMeta?.content || '';
  const assetUrl = path => `../${path.split('/').map(encodeURIComponent).join('/')}`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').trim();
  let products = [];
  let productSets = {};
  let catalogDocuments = [];
  let currentPage = 1;
  let activeSlug = '';
  let applicationViewSlug = '';
  let showingApplications = false;
  let florimType = 'stone';
  const brandIntro = document.querySelector('[data-brand-intro]');
  const brandButtons = [...document.querySelectorAll('[data-brand]')];
  const brandCopy = {
    'T-One': '<p class="eyebrow">T-ONE / PORSELEN TEZG&#194;H</p><p>T-ONE porselen tezg&#226;hlar&#305; Kalebodur porselen plakadan &#252;retilir. &#220;retici dok&#252;man&#305;nda 12 mm nominal kal&#305;nl&#305;k ve 160 &#215; 320 cm rektifiyeli ebat belirtilir; projede g&#252;ncel &#252;r&#252;n belgesini kontrol edin.</p>',
    'Kale': '<p class="eyebrow">KALE / BANYO &#220;R&#220;NLER&#304;</p><p>Kale; lavabo, klozet, armat&#252;r, du&#351; sistemi, banyo mobilyas&#305; ve tamamlay&#305;c&#305; &#252;r&#252;n gruplar&#305; sunar. A&#351;a&#287;&#305;daki se&#231;kide &#252;r&#252;n kodu ve &#252;retici sayfas&#305;nda do&#287;rulanabilen bilgiler g&#246;sterilir.</p>',
    'Kalebodur': '<p class="eyebrow">KALEBODUR / SERAM&#304;K VE PORSELEN</p><p>Kalebodur &#252;r&#252;n gam&#305;nda karo ve b&#252;y&#252;k ebatl&#305; porselen y&#252;zeyler bulunur. &#220;retici marka sayfas&#305; farkl&#305; &#252;r&#252;n aileleri i&#231;in 2&#8211;20 mm kal&#305;nl&#305;k ve 120 &#215; 120 ile 160 &#215; 320 cm aras&#305;nda formatlar listeler; her &#252;r&#252;n&#252;n &#246;l&#231;&#252;s&#252; ve teknik niteli&#287;i kendi kayd&#305;nda ayr&#305;ca belirtilir.</p>',
  };
  function selectBrand(brand) {
    if (!productSets[brand]) return;
    activeBrand = brand;
    catalogBrand = brand;
    products = productSets[brand];
    brandButtons.forEach(button => {
      const selected = button.dataset.brand === brand;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      const badge = button.querySelector('[data-brand-count]');
      if (badge) badge.textContent = String(productSets[brand].length).padStart(2, '0');
      button.disabled = false;
    });
    if (brandIntro) brandIntro.innerHTML = brandCopy[brand];
    search.placeholder = brand === 'T-One' ? 'Ürün adıyla ara' : 'Ürün, koleksiyon veya kodla ara';
    const searchLabel = document.querySelector('label[for="toneSearch"] .visually-hidden');
    if (searchLabel) searchLabel.textContent = `${brand} ürünlerinde ara`;
  }

  function visibleProducts() {
    const query = normalize(search.value);
    const categoryProducts = catalogBrand === 'Florim'
      ? products.filter(product => (product.specifications?.thickness === '12 mm' ? 'stone' : 'ceramiche') === florimType)
      : products;
    return query ? categoryProducts.filter(product => normalize(`${product.name} ${product.collection || ''} ${product.code || ''} ${product.description || ''}`).includes(query)) : categoryProducts;
  }

  function cardMarkup(product) {
    const image = product.mainImage;
    const collectionName = product.collection?.split(' · ').pop() || '';
    const collectionLabel = catalogBrand === 'Florim'
      ? `${product.specifications?.thickness === '12 mm' ? 'FLORIM stone · 12 mm' : 'Florim Ceramiche · 6 mm'}${collectionName ? ` · ${collectionName}` : ''}`
      : product.collection;
    const cardSrcset = image.smallThumbnail && image.thumbnail && image.smallThumbnail !== image.thumbnail
      ? `srcset="${assetUrl(image.smallThumbnail)} ${image.smallThumbnailWidth}w, ${assetUrl(image.thumbnail)} ${image.thumbnailWidth}w"`
      : '';
    return `<a class="tone-product-card" href="?urun=${encodeURIComponent(product.slug)}" data-product-link="${escapeHtml(product.slug)}" aria-label="${escapeHtml(product.name)} ürününü incele">
      <span class="tone-product-card__image"><img src="${assetUrl(image.thumbnail)}" ${cardSrcset} sizes="${escapeHtml(image.sizes || '(max-width: 680px) 46vw, 22vw')}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.imageAlt || product.name)}" loading="lazy" decoding="async"></span>
      <span class="tone-product-card__meta"><span class="tone-product-card__name">${escapeHtml(product.name)}${collectionLabel ? `<small class="tone-product-card__collection">${escapeHtml(collectionLabel)}</small>` : ''}</span><span class="tone-product-card__link">İncele&nbsp; ↗</span></span>
    </a>`;
  }

  function updateUrl({ push = false } = {}) {
    const url = new URL(window.location.href);
    if (catalogBrand === 'T-One' && activeBrand !== 'T-One') url.searchParams.set('marka', activeBrand);
    else url.searchParams.delete('marka');
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
      applicationViewSlug = '';
      showingApplications = false;
      if (detail.open) detail.close();
      detail.innerHTML = '';
      document.title = baseTitle;
      if (descriptionMeta) descriptionMeta.content = baseDescription;
      return;
    }
    if (applicationViewSlug !== product.slug) {
      applicationViewSlug = product.slug;
      showingApplications = false;
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
      ? `<div class="tone-detail__gallery${applications.length === 1 ? ' tone-detail__gallery--single' : ''}" aria-label="${escapeHtml(product.name)} mekan uygulamaları">${applications.map((application, index) => `<button type="button" data-lightbox-kind="application" data-image-index="${index}" aria-label="${escapeHtml(product.name)} mekan görselini büyüt"><img src="${assetUrl(application.thumbnail)}" width="${application.thumbnailWidth}" height="${application.thumbnailHeight}" alt="${escapeHtml(product.name)} taşının mekan uygulaması" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : '';
    const applicationStageMarkup = applications.length
      ? `<div class="tone-detail__application-stage${applications.length === 1 ? ' tone-detail__application-stage--single' : ''}" aria-label="${escapeHtml(product.name)} uygulama görselleri">${applications.map((application, index) => `<button type="button" data-lightbox-kind="application" data-image-index="${index}" aria-label="${escapeHtml(product.name)} uygulama görselini büyüt"><img src="${assetUrl(application.detailWebp || application.thumbnail)}" width="${application.width || application.thumbnailWidth}" height="${application.height || application.thumbnailHeight}" alt="${escapeHtml(product.name)} taşının uygulama görseli" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : '';

    const productSpecifications = { ...(product.specifications || {}) };
    if (catalogBrand === 'Florim') {
      productSpecifications.thickness = productSpecifications.thickness === '12 mm' ? '12 mm' : '6 mm';
    }
    if (catalogBrand === 'Florim' && !productSpecifications.dimensions && /120\s*[x×]\s*280/i.test(product.name)) {
      productSpecifications.dimensions = '120 × 280 cm';
    }
    const specifications = Object.entries(productSpecifications)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
      .map(([label, value]) => `<span><strong>${escapeHtml(({dimensions: 'Ebat', thickness: 'Kalınlık', surface: 'Yüzey', size: 'Ölçü', slipResistance: 'Kayma direnci', color: 'Renk', shape: 'Şekil', productGroup: 'Ürün grubu'})[label] || label)}:</strong> ${escapeHtml(value)}</span>`).join('');
    const descriptionMarkup = product.description
      ? `<p>${escapeHtml(product.description)}</p>`
      : (catalogBrand === 'T-One' ? '<p>Yüzey ve proje bilgisi için Bekamar ekibinden güncel bilgi alın.</p>' : '');
    const collectionMarkup = product.collection ? `<p class="tone-detail__collection">${escapeHtml(product.collection)}</p>` : '';
    const documentsMarkup = product.documents?.length
      ? `<div class="tone-detail__documents"><p class="eyebrow">ÜRÜN DOKÜMANLARI</p>${product.documents.map(document => `<p><a href="${assetUrl(document.file)}" target="_blank" rel="noopener">${escapeHtml(document.label)} <span aria-hidden="true">↗</span></a> <a class="tone-detail__download" href="${assetUrl(document.file)}" download>PDF indir <span aria-hidden="true">↓</span></a></p>`).join('')}</div>`
      : '';
    const sharesApplicationStage = catalogBrand === 'T-One' || catalogBrand === 'Florim';
    const applicationsMarkup = sharesApplicationStage
      ? (applications.length ? `<div class="tone-detail__applications"><button class="tone-detail__applications-toggle" type="button" data-toggle-applications aria-pressed="${showingApplications}">${showingApplications ? 'Plaka görselini göster' : 'Uygulama görsellerini göster'} <span aria-hidden="true">${showingApplications ? '↶' : '+'}</span></button></div>` : '')
      : applications.length ? `<div class="tone-detail__applications"><p class="eyebrow">Mekan uygulamaları</p>${galleryMarkup}</div>` : '';
    const productVisual = sharesApplicationStage && showingApplications
      ? applicationStageMarkup
      : `<button class="tone-detail__image-button" type="button" data-lightbox-kind="product" aria-label="${escapeHtml(product.name)} görselini büyüt" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in"><img class="tone-detail__main" src="${assetUrl(image.thumbnail)}" width="${image.thumbnailWidth}" height="${image.thumbnailHeight}" alt="${escapeHtml(product.name)} ${escapeHtml(productNoun)} dokusu" decoding="async"></button>`;
    const requestUrl = `../bize-ulasin/index.html?marka=${encodeURIComponent(catalogBrand)}&amp;urun=${encodeURIComponent(product.name)}`;
    detail.innerHTML = `<button class="tone-detail__close" type="button" data-close-detail aria-label="Ürün detayını kapat">×</button><div class="tone-detail__layout">
      ${productVisual}
      <div class="tone-detail__copy"><p class="eyebrow">${escapeHtml(catalogBrand)} / Ürün detayı</p><h3 tabindex="-1">${escapeHtml(product.name)}</h3>${collectionMarkup}${descriptionMarkup}${specifications ? `<div class="tone-detail__specs">${specifications}</div>` : ''}${documentsMarkup}<div class="tone-detail__actions"><button type="button" data-close-detail>← Koleksiyona dön</button><a href="${requestUrl}">Bekamar’dan bilgi alın ↗</a></div>${applicationsMarkup}</div></div>
    <div class="tone-detail__similar"><h4>Koleksiyondan diğer yüzeyler</h4><div class="tone-detail__similar-links">${otherProducts.map(item => `<a href="?urun=${encodeURIComponent(item.slug)}" data-product-link="${escapeHtml(item.slug)}">${escapeHtml(item.name)} ↗</a>`).join('')}</div></div>`;
    if (!detail.open) detail.showModal();
  }

  function render() {
    const filtered = visibleProducts();
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), pageCount);
    const visibleCount = Math.min(currentPage * PAGE_SIZE, filtered.length);
    const pageProducts = filtered.slice(0, visibleCount);
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
    pagination.hidden = filtered.length <= PAGE_SIZE;
    pageStatus.textContent = `${visibleCount} / ${filtered.length} ürün gösteriliyor`;
    const loadMore = pagination.querySelector('[data-load-more]');
    if (loadMore) loadMore.hidden = visibleCount >= filtered.length;
    const showLess = pagination.querySelector('[data-show-less]');
    if (showLess) showLess.hidden = currentPage <= 1;
    renderDetail();
  }

  function openLightbox(kind, index = 0) {
    const product = products.find(item => item.slug === activeSlug);
    if (!product) return;
    const image = kind === 'application' ? product.applications[index] : product.mainImage;
    if (!image) return;
    const alt = kind === 'application'
      ? `${product.name} taşının mekan uygulaması`
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
    detail.querySelector('h3')?.focus({ preventScroll: true });
    updateUrl({ push: true });
  });

  detail.addEventListener('click', event => {
    if (event.target === detail) {
      activeSlug = '';
      render();
      updateUrl({ push: true });
      return;
    }
    const galleryToggle = event.target.closest('[data-toggle-applications]');
    if (galleryToggle) {
      showingApplications = !showingApplications;
      renderDetail();
      detail.querySelector('[data-toggle-applications]')?.focus();
      return;
    }
    const link = event.target.closest('[data-product-link]');
    if (link) {
      event.preventDefault();
      activeSlug = link.dataset.productLink;
      render();
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

  detail.addEventListener('cancel', event => {
    event.preventDefault();
    activeSlug = '';
    render();
    updateUrl({ push: true });
  });

  pagination.addEventListener('click', event => {
    const loadMore = event.target.closest('[data-load-more]');
    const showLess = event.target.closest('[data-show-less]');
    if (!loadMore && !showLess) return;
    if (loadMore) currentPage += 1;
    if (showLess) currentPage = 1;
    activeSlug = '';
    render();
    updateUrl({ push: true });
    if (showLess) document.getElementById('koleksiyon').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  search.addEventListener('input', () => {
    currentPage = 1;
    activeSlug = '';
    render();
    updateUrl();
  });

  const florimTabs = [...document.querySelectorAll('[data-florim-type]')];
  const florimTablist = document.querySelector('[data-florim-tablist]');
  florimTablist?.addEventListener('keydown', event => {
    const currentIndex = florimTabs.indexOf(event.target.closest('[role="tab"]'));
    if (currentIndex < 0) return;
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % florimTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + florimTabs.length) % florimTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = florimTabs.length - 1;
    else return;
    event.preventDefault();
    florimTabs[nextIndex].focus();
    florimTabs[nextIndex].click();
  });

  florimTabs.forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    florimType = button.dataset.florimType;
    florimTabs.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    const productPanel = document.getElementById('toneProductPanel');
    if (florimTablist) florimTablist.dataset.activeTab = florimType;
    productPanel?.setAttribute('aria-labelledby', button.id);
    productPanel?.classList.add('is-switching');
    currentPage = 1;
    activeSlug = '';
    render();
    updateUrl();
    requestAnimationFrame(() => productPanel?.classList.remove('is-switching'));
  }));

  brandButtons.forEach(button => button.addEventListener('click', () => {
    selectBrand(button.dataset.brand);
    search.value = '';
    currentPage = 1;
    activeSlug = '';
    render();
    updateUrl({ push: true });
  }));

  document.querySelectorAll('[data-document-viewer]').forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const frame = details.querySelector('iframe[data-doc-src]');
      if (frame && !frame.hasAttribute('src')) frame.src = frame.dataset.docSrc;
    });
  });

  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.closest('#toneLightboxContent img')) lightbox.close();
  });
  window.addEventListener('popstate', () => {
    const url = new URL(window.location.href);
    const brand = catalogBrand === 'T-One' ? (url.searchParams.get('marka') || 'T-One') : catalogBrand;
    if (brand !== activeBrand) selectBrand(brand);
    activeSlug = url.searchParams.get('urun') || '';
    currentPage = Number(url.searchParams.get('sayfa') || 1);
    render();
  });

  brandButtons.forEach(button => { button.disabled = true; });
  Promise.all([
    fetch(productsUrl).then(response => { if (!response.ok) throw new Error('T-ONE data unavailable'); return response.json(); }),
    fetch(partnerProductsUrl).then(response => { if (!response.ok) throw new Error('Kale data unavailable'); return response.json(); }),
  ])
    .then(([toneData, partnerData]) => {
      productSets = {
        'T-One': toneData.products || [],
        'Kale': (partnerData.products || []).filter(product => product.brand === 'Kale'),
        'Kalebodur': (partnerData.products || []).filter(product => product.brand === 'Kalebodur'),
      };
      if (!productSets[catalogBrand]) productSets[catalogBrand] = toneData.products || [];
      selectBrand(activeBrand);
      catalogDocuments = toneData.catalogs || [];
      const catalogLink = document.getElementById(document.body.dataset.catalogLinksId || 'florimCatalogLinks');
      if (catalogLink) {
        catalogLink.innerHTML = catalogDocuments.length
          ? catalogDocuments.map(catalog => `<a class="catalog-document" href="${assetUrl(catalog.file)}" target="_blank" rel="noopener" aria-label="${escapeHtml(catalog.title)} katalo\u011funu a\u00e7">${catalog.preview ? `<img src="${assetUrl(catalog.preview)}" alt="${escapeHtml(catalog.title)} kapak g\u00f6rseli" loading="eager" fetchpriority="high" decoding="async">` : ''}<span>KATALO\u011eU A\u00c7 <b aria-hidden="true">&rarr;</b></span></a>`).join('')
          : `<a href="${escapeHtml(catalogRequestUrl)}">${escapeHtml(catalogBrand)} kataloğunu talep edin →</a>`;
      }
      const url = new URL(window.location.href);
      activeSlug = url.searchParams.get('urun') || '';
      currentPage = Number(url.searchParams.get('sayfa') || 1);
      const activeIndex = products.findIndex(product => product.slug === activeSlug);
      if (activeIndex >= 0 && !url.searchParams.has('sayfa')) currentPage = Math.floor(activeIndex / PAGE_SIZE) + 1;
      render();
      updateUrl();
      if (activeSlug) requestAnimationFrame(() => detail.querySelector('h3')?.focus({ preventScroll: true }));
    })
    .catch(() => {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '';
      count.textContent = 'Koleksiyon yüklenemedi';
      error.hidden = false;
    });
})();
