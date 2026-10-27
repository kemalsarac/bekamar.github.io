const newsCards = [...document.querySelectorAll('[data-news-card]')];
const newsFilters = [...document.querySelectorAll('[data-news-filter]')];
const newsCount = document.getElementById('newsCount');
const newsDetail = document.getElementById('newsDetail');
let selectedNewsButton = null;

newsFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.newsFilter;
    newsFilters.forEach(button => {
      const active = button === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    let visibleCount = 0;
    newsCards.forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (newsCount) newsCount.textContent = String(visibleCount).padStart(2, '0');
    if (selectedNewsButton?.closest('[data-news-card]')?.hidden) {
      selectedNewsButton.classList.remove('is-selected');
      selectedNewsButton.setAttribute('aria-expanded', 'false');
      selectedNewsButton = null;
      newsDetail.hidden = true;
    }
  });
});

if (newsDetail) {
  const openButtons = document.querySelectorAll('[data-news-open]');
  const title = document.getElementById('newsDetailTitle');
  const meta = newsDetail.querySelector('[data-news-detail-meta]');
  const body = newsDetail.querySelector('[data-news-detail-body]');
  const image = newsDetail.querySelector('.news-detail__image');

  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (selectedNewsButton) {
        selectedNewsButton.classList.remove('is-selected');
        selectedNewsButton.setAttribute('aria-expanded', 'false');
      }
      selectedNewsButton = button;
      selectedNewsButton.classList.add('is-selected');
      selectedNewsButton.setAttribute('aria-expanded', 'true');

      title.textContent = button.dataset.title || '';
      meta.textContent = button.dataset.meta || '';
      image.src = button.dataset.image || '';
      image.alt = button.querySelector('img')?.alt || '';
      body.replaceChildren(...(button.dataset.body || '').split('\n').filter(Boolean).map(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }));
      newsDetail.hidden = false;
      requestAnimationFrame(() => newsDetail.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      }));
    });
  });
}
