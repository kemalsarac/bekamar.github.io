(() => {
  const grid = document.getElementById('products');
  const search = document.getElementById('stoneSearch');
  const detail = document.getElementById('detailPanel');
  const modal = document.getElementById('stoneModal');
  const perPage = 15;
  const stoneType = document.body.dataset.stoneType || 'Taş';
  const productList = document.body.dataset.products || '../assets/granit/products.json';
  let products = [], filtered = [], selected = null, page = 1, listMode = false, userSelected = false;
  const cleanName = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const selectProduct = product => { selected = product; userSelected = true; render(); };
  function renderDetail(){
    if(!selected){detail.classList.remove('is-open');detail.innerHTML='<div class="granite-detail__empty"><span>01 / SEÇİLİ TAŞ</span><p>Koleksiyondan bir yüzey seçerek detaylarını inceleyin.</p></div>';return;}
    detail.classList.toggle('is-open',userSelected);
    detail.innerHTML=`<button class="granite-detail__close" type="button" aria-label="Detayları kapat">×</button><img class="granite-detail__image" src="${esc(selected.image)}" alt="${esc(selected.name)} ${esc(stoneType.toLocaleLowerCase("tr"))} dokusu"><div class="granite-detail__body"><span>DOĞAL TAŞ / ${esc(stoneType.toLocaleUpperCase("tr"))}</span><h3>${esc(selected.name)}</h3><p>Doğal ${esc(stoneType.toLocaleLowerCase("tr"))} yüzey. Renk ve desen, taşın doğal yapısı nedeniyle görsele göre farklılık gösterebilir.</p><div class="granite-detail__actions"><button class="primary" type="button" data-detail="${esc(selected.name)}">Detayları incele</button><a href="mailto:info@bekamar.com?subject=${encodeURIComponent(selected.name+' '+stoneType.toLocaleLowerCase("tr")+' bilgisi')}">Bilgi isteyin ↗</a></div></div>`;
    detail.querySelector('[data-detail]').addEventListener('click',()=>openModal(selected));
    detail.querySelector('.granite-detail__close').addEventListener('click',()=>{selected=null;render();});
  }
  function render(){
    const pages=Math.max(1,Math.ceil(filtered.length/perPage)); page=Math.min(page,pages);
    const start=(page-1)*perPage, shown=filtered.slice(start,start+perPage);
    document.getElementById('resultCount').textContent=filtered.length;
    document.getElementById('pageStatus').textContent=filtered.length?`${start+1}–${Math.min(start+perPage,filtered.length)} / ${filtered.length}`:'0 ürün';
    document.getElementById('paginationInfo').textContent=`${page} / ${pages}`;
    document.getElementById('prevPage').disabled=page<=1; document.getElementById('nextPage').disabled=page>=pages;
    grid.classList.toggle('is-list',listMode);
    grid.classList.toggle('is-featured',products.length<=3);
    grid.dataset.count=products.length;
    grid.innerHTML=shown.length?shown.map((p,i)=>`<button class="granite-product${selected?.image===p.image?' is-selected':''}" type="button" data-index="${start+i}" aria-label="${esc(p.name)} detaylarını göster"><img src="${esc(p.image)}" alt="${esc(p.name)} ${esc(stoneType.toLocaleLowerCase("tr"))}" loading="${i<5?'eager':'lazy'}" decoding="async"><span class="granite-product__name">${esc(p.name)}</span></button>`).join(''):'<p class="granite-empty">Aramanızla eşleşen ${stoneType.toLocaleLowerCase("tr")} bulunamadı.</p>';
    grid.querySelectorAll('img').forEach(img=>{if(img.complete)img.classList.add('loaded');else img.addEventListener('load',()=>img.classList.add('loaded'),{once:true});});
    grid.querySelectorAll('[data-index]').forEach(button=>button.addEventListener('click',()=>selectProduct(filtered[Number(button.dataset.index)])));
    renderDetail();
  }
  function openModal(product){document.getElementById('modalImage').src=product.image;document.getElementById('modalImage').alt=product.name+' '+stoneType.toLocaleLowerCase("tr");document.getElementById('modalTitle').textContent=product.name;modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.granite-modal__close').focus();}
  function closeModal(){modal.hidden=true;document.body.style.overflow='';}
  search.addEventListener('input',()=>{const q=cleanName(search.value.trim());filtered=products.filter(p=>cleanName(p.name).includes(q));page=1;render();});
  document.getElementById('prevPage').addEventListener('click',()=>{page--;render();});document.getElementById('nextPage').addEventListener('click',()=>{page++;render();});
  document.getElementById('gridToggle').addEventListener('click',()=>{listMode=false;document.getElementById('gridToggle').classList.add('is-active');document.getElementById('listToggle').classList.remove('is-active');document.getElementById('gridToggle').setAttribute('aria-pressed','true');document.getElementById('listToggle').setAttribute('aria-pressed','false');render();});
  document.getElementById('listToggle').addEventListener('click',()=>{listMode=true;document.getElementById('listToggle').classList.add('is-active');document.getElementById('gridToggle').classList.remove('is-active');document.getElementById('listToggle').setAttribute('aria-pressed','true');document.getElementById('gridToggle').setAttribute('aria-pressed','false');render();});
  modal.querySelector('.granite-modal__close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal();});
  document.querySelectorAll('.granite-tabs a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.granite-tabs a').forEach(el=>el.classList.toggle('is-active',el===a));}));
  fetch(productList).then(response=>{if(!response.ok)throw Error('Ürün listesi alınamadı');return response.json();}).then(data=>{products=data;filtered=products;selected=null;render();}).catch(()=>{grid.innerHTML=`<p class="granite-empty">${stoneType} koleksiyonu şu anda yüklenemiyor.</p>`;});
})();






