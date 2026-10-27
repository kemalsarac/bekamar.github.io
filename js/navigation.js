const navRoot = document.getElementById('nav');
const megaMenu = document.getElementById('megaMenu');
const mobileSubmenus = document.getElementById('mobileSubmenus');
if (navRoot && megaMenu && mobileSubmenus) {
  const assetPrefix = document.body.dataset.assetPrefix || '';
  const companyPath = document.body.dataset.companyPath || 'sirketimiz/index.html';
  navRoot.querySelector('[data-menu="corporate"]')?.setAttribute('href', companyPath);
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
      label: 'DO\u011EAL TA\u015ELAR', image: `${assetPrefix}assets/images/dogaltaslar.png`,
      imageAlt: 'Do\u011Fal ta\u015F plakas\u0131n\u0131n do\u011Fal damarlar\u0131',
      groups: [{ heading: 'DO\u011EAL TA\u015ELAR', items: [
        { label: 'Granit', href: `${assetPrefix}granit/index.html` }, { label: 'Mermer', href: `${assetPrefix}mermer/index.html` },
        { label: 'Onyx', href: `${assetPrefix}onyx/index.html` }, { label: 'Traverten', href: `${assetPrefix}traverten/index.html` },
      ] }]
    },
    engineered: {
      label: 'KOMPOZE \u00DCR\u00DCLER', image: `${assetPrefix}assets/images/porselenurunler.png`,
      imageAlt: 'Porselen ve kompoze y\u00FCzey',
      groups: [{ heading: 'MARKALAR', items: [
        { label: 'T-One', href: `${assetPrefix}t-one/index.html` }, { label: 'Florim', href: `${assetPrefix}florim/index.html` },
         { label: 'Calisco', href: `${assetPrefix}calisco/index.html` },
        { label: '\u00C7imstone', href: `${assetPrefix}cimstone/index.html` }
      ] }]
    },
    media: {
      label: 'MEDYA', simple: true,
      groups: [{ heading: 'MEDYA', items: [
        { label: 'Kataloglar', href: `${assetPrefix}kataloglar/index.html` }, { label: 'Logolar', href: 'https://bekamar.com/logolar' },
        { label: 'Do\u011Fa Foto\u011Fraflar\u0131', href: 'https://bekamar.com/doga-fotograflari' },
        { label: 'Video Galeri', href: 'https://bekamar.com/video-galeri' }
      ] }]
    }
  };
  const renderItems = items => items.map(item => `<a href="${item.href}">${item.label}</a>`).join('');
  const renderGroups = key => menuData[key].groups.map(group =>
    `<section class="mega-menu__group"><h2>${group.heading}</h2><div class="mega-menu__links">${renderItems(group.items)}</div></section>`
  ).join('');
  function renderMenu(key) {
    const data = menuData[key];
    if (!data) return;
    const feature = data.image ? `<div class="mega-feature" role="img" aria-label="${data.imageAlt}" style="background-image:url('${data.image}')"></div>` : '';
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
    link.addEventListener('mouseenter', () => { if (matchMedia('(min-width: 861px)').matches) openMenu(link.dataset.menu); });
    link.addEventListener('focus', () => { if (matchMedia('(min-width: 861px)').matches) openMenu(link.dataset.menu); });
    link.addEventListener('click', event => {
      if (matchMedia('(min-width: 861px) and (hover: none)').matches) {
        event.preventDefault(); event.stopPropagation();
        if (link.getAttribute('aria-expanded') === 'true') closeMenu(); else openMenu(link.dataset.menu);
      }
    });
  });
  navRoot.addEventListener('mouseleave', deferClose);
  megaMenu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  megaMenu.addEventListener('mouseleave', deferClose);
  megaMenu.addEventListener('focusin', () => clearTimeout(closeTimer));
  megaMenu.addEventListener('focusout', deferClose);
  megaMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (matchMedia('(max-width: 860px)').matches) {
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
      if (event.target.closest('a') && matchMedia('(max-width: 860px)').matches) {
        navRoot.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
