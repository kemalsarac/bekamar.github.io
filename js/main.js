/* Gerçek fotoğraflar hazır olduğunda: her kaydın `img` alanına dosya yolunu yazın.
   img yoksa taş dokulu yer tutucu gradyan gösterilir. */
const stone = (a, base, vein, end) =>
  `repeating-linear-gradient(${a}deg,transparent 0 38px,${vein} 38px 40px,transparent 40px 97px),linear-gradient(${a + 50}deg,${base},${end})`;
const bg = o => o.img ? `url("${o.img}") center/cover` : o.bg;

const stones = [
  { name:'Bal Onyx', note:'Zamansız zarafetiyle mekânlara benzersiz bir karakter kazandırır.', img:'assets/images/bal-onyx_536_485.jpg', applicationImg:'assets/images/onyx_uygulama.png', bg:stone(65,'#d9c9b0','rgba(110,80,50,.55)','#a89478') },
  { name:'Panda White', note:'Sıcak tonları ve doğal gözenekli dokusuyla ferah mekânlar yaratır.', img:'assets/images/pandawhite.png', applicationImg:'assets/images/pandawhite_uygulama.png', bg:stone(95,'#d8c7a8','rgba(150,120,80,.4)','#b49c78') },
  { name:'Elazığ Vişne',     note:'Derin zemini ve ince damarlarıyla dramatik bir sahne kurar.',        img:'assets/images/elazıg_visne.png', applicationImg:'assets/images/elazıgvisne_uygulama.png', bg:stone(70,'#2b2a28','rgba(220,210,190,.35)','#555049') },
  { name:'Carrara',       note:'Yumuşak geçişleriyle sakin ve zarif yüzeyler sunar.',                img:'assets/images/carrarawhite.png', applicationImg:'assets/images/carrarawhiteuygulama.png', bg:stone(120,'#e0d5c3','rgba(130,110,85,.3)','#bfae94') },
  { name:'Avakado',      note:'Işığı geçiren yoğun dokusuyla özel projelere değer katar.',          img:'assets/images/avakadourun.png', applicationImg:'assets/images/avakadouygulama.png', bg:stone(50,'#46564b','rgba(210,225,205,.35)','#2c382f') }
];
const cats = [
  ['Doğal Taşlar','Mermer, Traverten, Granit ve daha fazlası',0], ['Porselen Yüzeyler','Estetik ve dayanıklılığı buluşturan modern çözümler',3],
  ['Kuvars Yüzeyler','Yüksek performanslı, uzun ömürlü yüzeyler',2], ['Özel Ürünler','Mimari projeler için özel çözümler',4]
];
const catImages = [
  'assets/images/dogaltaslar.png',
  'assets/images/porselenurunler.png',
  'assets/images/kuvarsurunler.png',
  'assets/images/ozelurunler.png'
];
const apps = [
  ['Mutfak','linear-gradient(180deg,#5a4d40,#2c2723)'], ['Banyo',stone(100,'#cbbba2','rgba(90,70,50,.4)','#8c7b62')],
  ['İç Mekân','linear-gradient(200deg,#a58a68,#2a231d)'], ['Dış Mekân','linear-gradient(180deg,#d8cdbb,#4d5c66 70%,#1f2a31)']
].map(([t, g]) => ({ t, img:'', bg:g }));
apps[0].img = 'assets/images/mutfak.png';
apps[1].img = 'assets/images/banyo.png';
apps[2].img = 'assets/images/içmekan.png';
apps[3].img = 'assets/images/dişmekan.png';
const art = {
  pjC:{img:'',bg:stone(100,'#d6c9b3','rgba(110,90,65,.4)','#a8967a')},
  story:{img:'assets/images/\u015fubemerkez2.png',bg:''}
};
const brandLogos = [
  { name:'FLORIM', src:'assets/images/florim-logo-transparent.png' },
  { name:'CALISCO', src:'assets/images/calisco-transparent.png' },
  { name:'T-ONE', src:'assets/images/t-one-transparent.png' }
];
const branchNames = ['Şube 01 — [ŞEHİR]','Şube 02 — [ŞEHİR]','Şube 03 — [ŞEHİR]'];

const $ = id => document.getElementById(id);
const mod = (i, n) => (i + n) % n;
const el = (tag, props = {}, html = '') => Object.assign(document.createElement(tag), props, html && { innerHTML: html });

const heroVideo = document.querySelector('.hero__video');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function syncHeroVideoMotion() {
  if (reduceMotion.matches) heroVideo.pause();
  else heroVideo.play().catch(() => heroVideo.classList.add('is-unavailable'));
}
heroVideo.addEventListener('error', () => heroVideo.classList.add('is-unavailable'));
heroVideo.addEventListener('playing', () => heroVideo.classList.remove('is-unavailable'));
if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncHeroVideoMotion);
syncHeroVideoMotion();

/* Categories */
$('urunler').append(...cats.map(([t, d], i) => {
  const a = el('a', { className:'cat', href:'#koleksiyon' }, `<img class="cat__sw" src="${catImages[i]}" alt="" loading="lazy" decoding="async"><div><h3 class="serif">${t}</h3><p class="body">${d}</p><span>→</span></div>`);
  return a;
}));
/* Collection */
let c = 0;
const thumbsEl = $('thumbs');
stones.forEach((s, i) => {
  const b = el('button', { className:'thumb', ariaLabel:s.name, onclick:() => { c = i; renderCol(); } });
  b.style.background = bg(s); thumbsEl.append(b);
});
function renderCol() {
  const s = stones[c];
  $('colBg').style.background = bg(s);
  const application = $('colApplication');
  application.hidden = !s.applicationImg;
  if (s.applicationImg) { application.src = s.applicationImg; application.alt = s.name + ' uygulama örneği'; }
  $('colName').textContent = s.name; $('colNote').textContent = s.note; $('colIdx').textContent = `0${c + 1} / 0${stones.length}`;
  [...thumbsEl.children].forEach((b, i) => b.setAttribute('aria-current', i === c));
}
$('cPrev').onclick = () => { c = mod(c - 1, stones.length); renderCol(); };
$('cNext').onclick = () => { c = mod(c + 1, stones.length); renderCol(); };

/* Applications */
$('apps').append(...apps.map(a => {
  const t = el('a', { className:'tile', href:'#projeler' }, `<div class="media"></div><div class="tile__cap"><h3 class="serif">${a.t}</h3><small>Keşfet →</small></div>`);
  t.querySelector('.media').style.background = bg(a); return t;
}));

/* Brands and projects */
$('brands').append(...brandLogos.map(({ name, src }) => {
  const item = el('div', { className:'brands__logo' });
  item.append(el('img', { src, alt:name, loading:'lazy', decoding:'async' }));
  return item;
}));
document.querySelectorAll('[data-bg]').forEach(m => { m.style.background = bg(art[m.dataset.bg]); });
const skin3Section = $('projeler');
let skin3OpenTimeout = null;
const skin3Observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.intersectionRatio >= 0.2) {
      if (!skin3Section.classList.contains('is-open') && skin3OpenTimeout === null) {
        skin3OpenTimeout = window.setTimeout(() => {
          skin3Section.classList.add('is-open');
          skin3OpenTimeout = null;
        }, 550);
      }
    } else {
      window.clearTimeout(skin3OpenTimeout);
      skin3OpenTimeout = null;
      skin3Section.classList.remove('is-open');
    }
  });
}, { threshold: [0, 0.2] });
skin3Observer.observe(skin3Section);
renderCol();
