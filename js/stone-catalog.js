(() => {
  const grid = document.getElementById('products');
  const detail = document.getElementById('detailPanel');
  const modal = document.getElementById('stoneModal');
  const perPage = 15;
  const stoneType = document.body.dataset.stoneType || 'Taş';
  const productList = document.body.dataset.products || '../assets/granit/products.json';
  let products = [], filtered = [], selected = null, page = 1, listMode = false, userSelected = false;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const selectProduct = product => { selected = product; userSelected = true; render(); };
  function renderDetail(){
    if(!selected){detail.classList.remove('is-open');detail.innerHTML='<div class="granite-detail__empty"><span>01 / SEÇİLİ TAŞ</span><p>Koleksiyondan bir yüzey seçerek detaylarını inceleyin.</p></div>';return;}
    detail.classList.toggle('is-open',userSelected);
    const specs = Object.entries(selected.specifications || {}).filter(([, value]) => value && String(value).trim());
    const specLabels = { surface: 'Yüzey', dimensions: 'Ebat', size: 'Ebat', origin: 'Menşei', thickness: 'Kalınlık' };
    const specMarkup = specs.map(([key, value]) => `<p><strong>${esc(specLabels[key] || key)}:</strong> ${esc(value)}</p>`).join('');
    detail.innerHTML=`<button class="granite-detail__close" type="button" aria-label="Detayları kapat">×</button><button class="granite-detail__image-button" type="button" aria-label="${esc(selected.name)} görselini büyüt"><img class="granite-detail__image" src="${esc(selected.image)}" alt="${esc(selected.name)} ${esc(stoneType.toLocaleLowerCase("tr"))} dokusu"></button><div class="granite-detail__body"><span>DOĞAL TAŞ / ${esc(stoneType.toLocaleUpperCase("tr"))}</span><h3>${esc(selected.name)}</h3>${selected.description ? `<p>${esc(selected.description)}</p>` : ''}${specMarkup}<div class="granite-detail__actions"><a href="mailto:info@bekamar.com?subject=${encodeURIComponent(selected.name+' '+stoneType.toLocaleLowerCase("tr")+' bilgisi')}">Bilgi isteyin ↗</a></div></div>`;
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
    grid.innerHTML=shown.length?shown.map((p,i)=>`<button class="granite-product${selected?.image===p.image?' is-selected':''}" type="button" data-index="${start+i}" aria-label="${esc(p.name)} görselini büyüt"><img src="${esc(p.image)}" alt="${esc(p.name)} ${esc(stoneType.toLocaleLowerCase("tr"))}" loading="${i<5?'eager':'lazy'}" decoding="async"><span class="granite-product__name">${esc(p.name)}</span></button>`).join(''):'<p class="granite-empty">Koleksiyonda ürün bulunamadı.</p>';
    grid.querySelectorAll('img').forEach(img=>{if(img.complete)img.classList.add('loaded');else img.addEventListener('load',()=>img.classList.add('loaded'),{once:true});});
    grid.querySelectorAll('[data-index]').forEach(button=>button.addEventListener('click',()=>{const product=filtered[Number(button.dataset.index)];selectProduct(product);openModal(product);}));
    renderDetail();
  }
  function openModal(product){
    document.getElementById('modalImage').src=product.image;
    document.getElementById('modalImage').alt=product.name+' '+stoneType.toLocaleLowerCase("tr");
    document.getElementById('modalTitle').textContent=product.name;
    const source = product.specifications || {};
    const fields = [
      ['Kalınlık', source.thickness || '2 cm'],
      ['Yüzey', source.surface || 'Cilalı'],
      ['Ebat', source.dimensions || source.size || '320 × 160 cm'],
      ['Menşei', source.origin || 'Hindistan']
    ];
    document.getElementById('modalSpecs').innerHTML=fields.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('');
    const infoUrl=new URL('../bize-ulasin/index.html',location.href);
    infoUrl.searchParams.set('konu','granit');
    infoUrl.searchParams.set('urun',product.name);
    document.getElementById('modalInfoLink').href=infoUrl.href;
    modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.granite-modal__close').focus();
  }
  function closeModal(){modal.hidden=true;document.body.style.overflow='';grid.querySelector(`[data-index="${filtered.indexOf(selected)}"]`)?.focus();}
  document.getElementById('prevPage').addEventListener('click',()=>{page--;render();});document.getElementById('nextPage').addEventListener('click',()=>{page++;render();});
  document.getElementById('gridToggle').addEventListener('click',()=>{listMode=false;document.getElementById('gridToggle').classList.add('is-active');document.getElementById('listToggle').classList.remove('is-active');document.getElementById('gridToggle').setAttribute('aria-pressed','true');document.getElementById('listToggle').setAttribute('aria-pressed','false');render();});
  document.getElementById('listToggle').addEventListener('click',()=>{listMode=true;document.getElementById('listToggle').classList.add('is-active');document.getElementById('gridToggle').classList.remove('is-active');document.getElementById('listToggle').setAttribute('aria-pressed','true');document.getElementById('gridToggle').setAttribute('aria-pressed','false');render();});
  modal.querySelector('.granite-modal__close').addEventListener('click',closeModal);
  detail.addEventListener('click',event=>{if(event.target.closest('.granite-detail__image-button'))openModal(selected);});
  document.querySelectorAll('.granite-tabs a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.granite-tabs a').forEach(el=>el.classList.toggle('is-active',el===a));}));
  fetch(productList).then(response=>{if(!response.ok)throw Error('Ürün listesi alınamadı');return response.json();}).then(data=>{products=data;filtered=products;selected=null;render();}).catch(()=>{grid.innerHTML=`<p class="granite-empty">${stoneType} koleksiyonu şu anda yüklenemiyor.</p>`;});
})();






