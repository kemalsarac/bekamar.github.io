(() => {
  const grid = document.getElementById('products');
  const modal = document.getElementById('stoneModal');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalInfoLink = document.getElementById('modalInfoLink');
  const pagination = document.getElementById('stonePagination');
  const loadMore = document.getElementById('stoneLoadMore');
  const showLess = document.getElementById('stoneShowLess');
  const batchSize = 15;
  const stoneType = document.body.dataset.stoneType || 'Taş';
  const productList = document.body.dataset.products || '../assets/granit/products.json';
  let products = [], filtered = [], selected = null, visibleLimit = batchSize, listMode = false;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const productLabel = name => esc(name).replace(/\b(?:Baltic|White|Magic|Platinum|Rain|Violet|Light|Spain|Olive|Iranian)\b/g, '<span lang="en">$&</span>');
  function render(){
    const shown = filtered.slice(0, visibleLimit);
    document.getElementById('resultCount').textContent=filtered.length;
    document.getElementById('pageStatus').textContent = filtered.length ? `1–${shown.length} / ${filtered.length}` : '0 ürün';
    document.getElementById('paginationInfo').textContent = `${shown.length} / ${filtered.length} ürün gösteriliyor`;
    pagination.hidden = filtered.length <= batchSize;
    loadMore.hidden = shown.length >= filtered.length;
    showLess.hidden = visibleLimit <= batchSize;
    grid.classList.toggle('is-list',listMode);
    grid.classList.toggle('is-featured',products.length<=3);
    grid.dataset.count=products.length;
    grid.innerHTML=shown.length?shown.map((p,i)=>`<button class="granite-product${selected?.image===p.image?' is-selected':''}" type="button" data-index="${i}" aria-haspopup="dialog" aria-label="${esc(p.name)} ürün detayını aç"><span class="stone-portrait"><img src="${esc(p.image)}" alt="" loading="${i<5?'eager':'lazy'}" decoding="async"></span><span class="granite-product__name">${productLabel(p.name)}</span></button>`).join(''):'<p class="granite-empty">Koleksiyonda ürün bulunamadı.</p>';
    grid.querySelectorAll('img').forEach(img=>{if(img.complete)img.classList.add('loaded');else img.addEventListener('load',()=>img.classList.add('loaded'),{once:true});});
  }
  function openModal(product){
    document.getElementById('modalImage').src=product.image;
    document.getElementById('modalImage').alt=product.name+' '+stoneType.toLocaleLowerCase("tr");
    document.getElementById('modalTitle').textContent=product.name;
    const specLabels = {surface:'Yüzey', dimensions:'Ebat', size:'Ebat', origin:'Menşei', thickness:'Kalınlık'};
    const fields = [['Taş türü', stoneType], ...Object.entries(product.specifications || {})
      .filter(([, value]) => value != null && String(value).trim())
      .map(([key, value]) => [specLabels[key] || key, value])];
    modalSpecs.innerHTML = fields.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
    if (modalInfoLink) {
      const infoUrl = new URL(modalInfoLink.href);
      infoUrl.searchParams.set('urun', product.name);
      modalInfoLink.href = infoUrl.href;
    }
    modal.showModal();
  }
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    selected = filtered[Number(button.dataset.index)];
    grid.querySelector('.is-selected')?.classList.remove('is-selected');
    button.classList.add('is-selected');
    openModal(selected);
  });
  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  loadMore.addEventListener('click', () => {
    const nextIndex = visibleLimit;
    visibleLimit += batchSize;
    render();
    const nextProduct = grid.querySelector(`[data-index="${nextIndex}"]`);
    nextProduct?.focus({preventScroll:true});
    nextProduct?.scrollIntoView({behavior:scrollBehavior(), block:'center'});
  });
  showLess.addEventListener('click', () => {
    visibleLimit = batchSize;
    if (filtered.indexOf(selected) >= visibleLimit) selected = null;
    render();
    grid.querySelector('[data-index="0"]')?.focus({preventScroll:true});
    document.getElementById('koleksiyon').scrollIntoView({behavior:scrollBehavior(), block:'start'});
  });
  document.getElementById('gridToggle').addEventListener('click',()=>{listMode=false;document.getElementById('gridToggle').classList.add('is-active');document.getElementById('listToggle').classList.remove('is-active');document.getElementById('gridToggle').setAttribute('aria-pressed','true');document.getElementById('listToggle').setAttribute('aria-pressed','false');render();});
  document.getElementById('listToggle').addEventListener('click',()=>{listMode=true;document.getElementById('listToggle').classList.add('is-active');document.getElementById('gridToggle').classList.remove('is-active');document.getElementById('listToggle').setAttribute('aria-pressed','true');document.getElementById('gridToggle').setAttribute('aria-pressed','false');render();});
  modal.querySelector('.granite-modal__close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
  document.querySelectorAll('.granite-tabs a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.granite-tabs a').forEach(el=>el.classList.toggle('is-active',el===a));}));
  fetch(productList).then(response=>{if(!response.ok)throw Error('Ürün listesi alınamadı');return response.json();}).then(data=>{products=data;filtered=products;selected=null;render();}).catch(()=>{grid.innerHTML=`<p class="granite-empty">${stoneType} koleksiyonu şu anda yüklenemiyor.</p>`;});
})();






