if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('pageshow', event => { if (performance.getEntriesByType('navigation')[0]?.type === 'reload') window.scrollTo(0, 0); });
const navRoot = document.getElementById('nav');
const megaMenu = document.getElementById('megaMenu');
const mobileSubmenus = document.getElementById('mobileSubmenus');
if (navRoot && megaMenu && mobileSubmenus) {
  const assetPrefix = document.body.dataset.assetPrefix || '';
  const companyPath = document.body.dataset.companyPath || 'sirketimiz/index.html';
  navRoot.querySelector('[data-menu="corporate"]')?.setAttribute('href', companyPath);
  navRoot.querySelector('[data-menu="natural"]')?.setAttribute('href', `${assetPrefix}dogal-taslar/index.html`);
  navRoot.querySelector('[data-menu="engineered"]')?.setAttribute('href', `${assetPrefix}kompoze-urunler/index.html`);
  const menuData = {
    corporate: {
      label: 'KURUMSAL', simple: true,
      groups: [{ heading: 'BEKAMAR', items: [
        { label: '\u015Eirketimiz', href: companyPath },
        { label: 'Birimlerimiz', href: `${assetPrefix}birimlerimiz/index.html` },
        { label: '\u015Eubelerimiz', href: `${assetPrefix}subelerimiz/index.html` },
        { label: 'Haberler', href: `${assetPrefix}haberler/index.html` }
      ] }]
    },
    natural: {
      label: 'DO\u011EAL TA\u015ELAR', image: `${assetPrefix}assets/optimized/site/dogaltaslar-1366.webp`,
      imageAlt: 'Do\u011Fal ta\u015F plakas\u0131n\u0131n do\u011Fal damarlar\u0131',
      groups: [{ heading: 'DO\u011EAL TA\u015ELAR', items: [
        { label: 'Quartzite (Kuvarsit)', href: `${assetPrefix}dogal-taslar/index.html#quartzite`, image: `${assetPrefix}assets/optimized/tone/products/quarzite-j-adore-162x323cm-12mm-1600.webp`, imageAlt: 'Quartzite g\u00f6r\u00fcn\u00fcml\u00fc y\u00fczey' },
        { label: 'Granit', href: `${assetPrefix}granit/index.html`, image: `${assetPrefix}assets/optimized/site/granitin-zamansiz-mimarisi-1600.webp`, imageAlt: 'Granit ta\u015f dokusu' },
        { label: 'Mermer', href: `${assetPrefix}mermer/index.html`, image: `${assetPrefix}assets/optimized/site/mermer-tezgahta-modern-mutfak-naturmortu-1600.webp`, imageAlt: 'Mermer y\u00fczey' },
        { label: 'Onyx', href: `${assetPrefix}onyx/index.html`, image: `${assetPrefix}assets/optimized/site/iranian-blue-onyx-502-290-502.webp`, imageAlt: 'Onyx ta\u015f dokusu' },
        { label: 'Traverten', href: `${assetPrefix}traverten/index.html`, image: `${assetPrefix}assets/optimized/site/traverten-duvarli-modern-salon-1600.webp`, imageAlt: 'Traverten ta\u015f dokusu' },
      ] }]
    },
    engineered: {
      label: 'MARKALARIMIZ', image: `${assetPrefix}assets/optimized/tone/applications/calacatta-gold-v2-1200.webp`,
      imageAlt: 'T-ONE Calacatta Gold porselen yüzeyin mutfak uygulaması',
      groups: [{ heading: 'MARKALAR', items: [
        { label: 'T-One', href: `${assetPrefix}t-one/index.html`, image: `${assetPrefix}assets/optimized/tone/applications/calacatta-gold-v2-1200.webp`, imageAlt: 'T-ONE Calacatta Gold porselen yüzeyin mutfak uygulaması' },
        { label: 'Florim', href: `${assetPrefix}florim/index.html`, image: `${assetPrefix}assets/optimized/florim/awards/rinascenza-award-800.webp`, imageAlt: 'Florim Rinascenza koleksiyonundan mimari yüzey uygulaması' },
        { label: 'Calisco', href: `${assetPrefix}calisco/index.html`, image: `${assetPrefix}assets/optimized/calisco/products/admira-2101-502.webp`, imageAlt: 'Calisco kuvars yüzey koleksiyonundan Admira' },
        { label: 'Çimstone', href: `${assetPrefix}cimstone/index.html`, image: `${assetPrefix}assets/optimized/cimstone/products/100-hierapolis-502.webp`, imageAlt: 'Çimstone kuvars yüzey koleksiyonundan Hierapolis' }
      ] }]
    },
    media: {
      label: 'MEDYA', simple: true,
      groups: [{ heading: 'MEDYA', items: [
        { label: 'Kataloglar', href: `${assetPrefix}kataloglar/index.html` },
        { label: '\u015Eube Foto\u011Fraflar\u0131', href: `${assetPrefix}sirketimiz/index.html#branchGallery` },
        { label: 'Video Galeri', unavailable: true }
      ] }]
    }
  };
  const renderItems = items => items.map(item => item.unavailable
    ? `<span class="menu-link--unavailable">${item.label}<small>Yak\u0131nda</small></span>`
    : `<a href="${item.href}"${item.image ? ` data-feature-image="${item.image}" data-feature-alt="${item.imageAlt}"` : ''}>${item.label}</a>`).join('');
  const renderGroups = key => menuData[key].groups.map(group =>
    `<section class="mega-menu__group"><h2>${group.heading}</h2><div class="mega-menu__links">${renderItems(group.items)}</div></section>`
  ).join('');
  function renderMenu(key) {
    const data = menuData[key];
    if (!data) return;
    const normalizePath = path => path.replace(/index\.html$/, '').replace(/\/+$/, '');
    const currentPath = normalizePath(location.pathname);
    const currentItem = data.groups.flatMap(group => group.items).find(item => item.image && normalizePath(new URL(item.href, location.href).pathname) === currentPath);
    const featureImage = currentItem?.image || data.image;
    const featureAlt = currentItem?.imageAlt || data.imageAlt;
    const feature = featureImage ? `<div class="mega-feature" role="img" aria-label="${featureAlt}" style="background-image:url('${featureImage}')"></div>` : '';
    megaMenu.innerHTML = `<div class="mega-menu__grid${data.simple ? ' mega-menu__grid--simple' : ''}">${renderGroups(key)}${feature}</div>`;
    megaMenu.setAttribute('aria-hidden', 'false');
    navRoot.querySelectorAll('[data-menu]').forEach(link => link.setAttribute('aria-expanded', String(link.dataset.menu === key)));
  }
  let closeTimer;
  function openMenu(key) {
    clearTimeout(closeTimer);
    renderMenu(key);
    document.documentElement.style.setProperty('--mega-top', `${document.querySelector('.site-header').getBoundingClientRect().bottom + 10}px`);
    megaMenu.classList.add('is-open');
  }
  function closeMenu() {
    clearTimeout(closeTimer);
    megaMenu.classList.remove('is-open');
    megaMenu.setAttribute('aria-hidden', 'true');
    navRoot.querySelectorAll('[data-menu]').forEach(link => link.setAttribute('aria-expanded', 'false'));
  }
  const deferClose = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeMenu, 140); };
  navRoot.querySelectorAll('[data-menu]').forEach(link => {
    link.addEventListener('mouseenter', () => { if (matchMedia('(min-width: 1101px)').matches) openMenu(link.dataset.menu); });
    link.addEventListener('focus', () => { if (matchMedia('(min-width: 1101px)').matches) openMenu(link.dataset.menu); });
    link.addEventListener('click', event => {
      if (!['natural', 'engineered'].includes(link.dataset.menu) && matchMedia('(min-width: 1101px) and (hover: none)').matches) {
        event.preventDefault(); event.stopPropagation();
        if (link.getAttribute('aria-expanded') === 'true') closeMenu(); else openMenu(link.dataset.menu);
      }
    });
  });
  navRoot.addEventListener('mouseleave', deferClose);
  megaMenu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  const updateFeatureImage = event => {
    const link = event.target.closest?.('a[data-feature-image]');
    const feature = megaMenu.querySelector('.mega-feature');
    if (!link || !feature || !megaMenu.contains(link)) return;
    feature.style.backgroundImage = `url("${link.dataset.featureImage}")`;
    feature.setAttribute('aria-label', link.dataset.featureAlt || link.textContent.trim());
  };
  megaMenu.addEventListener('pointerover', updateFeatureImage);
  megaMenu.addEventListener('focusin', updateFeatureImage);
  megaMenu.addEventListener('mouseleave', deferClose);
  megaMenu.addEventListener('focusin', () => clearTimeout(closeTimer));
  megaMenu.addEventListener('focusout', deferClose);
  megaMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (matchMedia('(max-width: 1100px)').matches) {
        navRoot.querySelectorAll('.mobile-submenu__toggle[aria-expanded="true"]').forEach(button => {
          button.setAttribute('aria-expanded', 'false');
          document.getElementById(button.getAttribute('aria-controls'))?.classList.remove('is-open');
        });
        navRoot.classList.remove('open');
        document.getElementById('menuBtn')?.setAttribute('aria-expanded', 'false');
        document.getElementById('menuBtn')?.focus();
        return;
      }
      const trigger = navRoot.querySelector('[aria-expanded="true"]');
      closeMenu(); trigger?.focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('#nav, #megaMenu')) closeMenu(); });
  Object.entries(menuData).forEach(([key, data]) => {
    const section = document.createElement('section');
    section.className = 'mobile-submenu';
    const button = document.createElement('button');
    button.className = 'mobile-submenu__toggle'; button.type = 'button'; button.textContent = data.label;
    button.id = `mobile-submenu-${key}-toggle`;
    button.setAttribute('aria-expanded', 'false');
    const content = document.createElement('div');
    content.className = 'mobile-submenu__content'; content.id = `mobile-submenu-${key}`; content.innerHTML = renderGroups(key);
    button.setAttribute('aria-controls', content.id);
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded)); content.classList.toggle('is-open', expanded);
    });
    content.addEventListener('click', event => {
      if (event.target.closest('a')) {
        navRoot.classList.remove('open'); document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
      }
    });
    section.append(button, content); mobileSubmenus.append(section);
  });
  const menuButton = document.getElementById('menuBtn');
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      const expanded = navRoot.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(expanded));
    });
    navRoot.addEventListener('click', event => {
      if (event.target.closest('a') && matchMedia('(max-width: 1100px)').matches) {
        navRoot.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
