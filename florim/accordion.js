(() => {
  const list = document.querySelector('.florim-info__list');
  if (!list) return;
  const items = [...list.querySelectorAll(':scope > .florim-info-item')];
  const openHashTarget = () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const parent = target?.closest('.florim-info-item');
    if (parent) parent.open = true;
  };
  items.forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    items.forEach(other => { if (other !== item && other.open) other.open = false; });
  }));
  openHashTarget();
  window.addEventListener('hashchange', openHashTarget);
})();
