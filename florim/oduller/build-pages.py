from __future__ import annotations
import html, json, re
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'optimized' / 'florim' / 'award-surfaces'
OUT.mkdir(parents=True, exist_ok=True)
products = json.loads((ROOT / 'assets/optimized/florim/products.json').read_text(encoding='utf-8'))['products']
by_id = {p['id']: p for p in products}

# Award facts and collection descriptions are based on Florim's official announcements/pages.
awards = [
 {'slug':'rinascenza','name':'Rinascenza','heroLabel':'CREATIVE DESIGN / NICOLA GALLIZIA','heroLead':'Ge\u00e7mi\u015f, bug\u00fcn ve gelece\u011fi bulu\u015fturan koleksiyonu Florim\u2019in resm\u00ee sayfas\u0131nda inceleyin.','collectionCta':'Koleksiyon sayfas\u0131','award':'Archiproducts Design Award','year':'2026','category':'Uluslararası tasarım ödülü','designer':'Nicola Gallizia','role':'Tasarım','date':'19 Kasım 2026','source':'https://www.florim.com/en/journal/news/rinascenza-wins-at-the-archiproducts-design-awards-2026','collection':'https://www.florim.com/en/products/all-collections/rinascenza','image':'rinascenza-award-1200.webp','width':1200,'height':800,'alt':'Rinascenza koleksiyonundan Modulo Pietra yüzeyinin mimari sunumu','story':'Nicola Gallizia imzalı Rinascenza, İtalyan mimari mirasının izlerini çağdaş bir yüzey diliyle yeniden yorumluyor. Koleksiyon; geçmiş ile bugünü, malzemenin hafızası ve incelikli yüzey detayları üzerinden buluşturuyor.','awardStory':'Florim’in tasarım araştırması ile uluslararası tasarımcılar arasındaki diyaloğunu öne çıkaran Archiproducts Design Award 2026, Rinascenza’nın özgün yaklaşımını ödüllendirdi.','products':['florim-074','florim-075','florim-076'],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1795095028%2F2614%2F&w=1920','officialAlt':'Florim’in Rinascenza koleksiyonunu tanıtan resmî ödül görseli'},
 {'slug':'sensiterre','name':'SensiTerre','award':'Wallpaper* Design Awards','year':'2025','category':'Yılın tasarım seçkisi','designer':'Florim × Matteo Thun','role':'Tasarım iş birliği','date':'17 Ocak 2025','source':'https://www.florim.com/en/journal/news/wallpaper-design-awards-2025','collection':'https://www.florim.com/en/products/all-collections/sensiterre','image':'sensiterra-1600.webp','width':1600,'height':900,'alt':'SensiTerre koleksiyonu ve Wallpaper* Design Awards 2025 rozeti','story':'SensiTerre, toprağın ve kilin zanaat belleğini çağdaş mimarinin ölçeğine taşıyor. Florim ile Matteo Thun iş birliği; el işçiliğinin duyusal niteliğini ileri üretim teknolojileriyle bir araya getiriyor.','awardStory':'Wallpaper* Design Awards 2025, tasarım, moda, teknoloji, mimari, iç mekân, seyahat ve sanat alanlarında yılın dikkat çeken işlerini bir araya getirdi. SensiTerre, bu uluslararası seçkide yer aldı.','products':['florim-079','florim-080','florim-081'],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1737099270%2F1519%2F&w=1920','officialAlt':'Florim’in SensiTerre koleksiyonunu tanıtan resmî Wallpaper* ödül görseli'},
 {'slug':'formatech','name':'Formatech','award':'Green Good Design Award','year':'2026','category':'Sürdürülebilir tasarım','designer':'Gensler','role':'Florim ile tasarım iş birliği','date':'25 Mart 2026','source':'https://www.florim.com/en/journal/news/formatech-vince-il-green-good-design-award-2026','collection':'https://www.florim.com/en/products/all-collections/formatech','image':'formatech-1600.webp','width':1600,'height':1055,'alt':'Florim Formatech koleksiyonunun mimari yüzey uygulaması','story':'Formatech, Florim ile Gensler’in malzeme, dönüşüm ve zaman içinde kalıcılık üzerine ortak araştırmasından doğdu. Beton, metal ve sıva gibi temel malzemelerin karakterini mimari yüzeylere taşıyor.','awardStory':'Chicago Athenaeum ve European Centre for Architecture Art Design and Urban Studies tarafından desteklenen Green Good Design Award, tasarımda sürdürülebilirlik ve çevresel sorumluluğu öne çıkarıyor. Formatech, 2026 seçkisinde ödüle layık görüldü.','products':[],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1774446100%2F2041%2F&w=1920','officialAlt':'Florim’in Formatech koleksiyonuna ait resmî açık hava mutfağı uygulaması'},
 {'slug':'sensietna','name':'SensiEtna','award':'IDEAT Design Awards · Best covering','year':'2026','category':'Best covering','designer':'Matteo Thun & Partners','role':'Tasarım','date':'4 Mayıs 2026','source':'https://www.florim.com/en/journal/news/sensietna-premiata-agli-ideat-design-awards-2026','collection':'https://www.florim.com/en/products/all-collections/sensietna','image':'sensietna-1296.webp','width':1296,'height':860,'alt':'Florim Ceramiche SensiEtna koleksiyonundan yüzeyler','story':'SensiEtna, Etna Yanardağı’nın ham gücünden ve Sicilya’nın doğal karakterinden ilham alıyor. Matteo Thun & Partners ile geliştirilen koleksiyonda lav, malzemenin belirgin bir anlatım öğesine dönüşüyor.','awardStory':'Fransız tasarım dergisi IDEAT, SensiEtna’yı IDEAT Design Awards 2026 kapsamında “Best covering” olarak seçti. Ödül, Milano Design Week sırasında takdim edildi.','products':[],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1777982034%2F2180%2F&w=1920','officialAlt':'Florim’in SensiEtna koleksiyonundan resmî ödül görseli'},
 {'slug':'segnature-cedit','name':'Segnature – CEDIT','award':'ADI Design Index','year':'2026','category':'ADI Design Index seçkisi','designer':'Cristina Celestino','role':'CEDIT için tasarım','date':'2 Ekim 2026','source':'https://www.florim.com/es/journal/news/segnature-entra-en-el-adi-design-index-2026','collection':'https://www.florim.com/en/products/all-collections/segnature','image':'segnature-cedit-1600.webp','width':1600,'height':1066,'alt':'Cristina Celestino tarafından CEDIT için tasarlanan Segnature yüzeyleri','story':'Cristina Celestino’nun CEDIT için tasarladığı Segnature, krep kâğıdının düzenli izlerinden, bitki damarlarından ve tekstil geometrilerinden yola çıkıyor. Işık ve bakış açısı değiştikçe algısı dönüşen seramik yüzeyler öneriyor.','awardStory':'Segnature, ADI – Associazione per il Disegno Industriale tarafından yayımlanan ADI Design Index 2026 seçkisine alındı. Bu, bir ödül kazanımı değil; İtalyan tasarımının yıllık seçkisinde yer alma başarısıdır.','products':[],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1758211264%2F1718%2F&w=1920','officialAlt':'Florim’in CEDIT Segnature koleksiyonunu tanıtan resmî ADI Design Index 2026 görseli'},
 {'slug':'sensi','name':'Sensi','award':'Green Good Design Award','year':'2021','category':'Sürdürülebilir tasarım','designer':'Matteo Thun & Partners','role':'Tasarım','date':'4 Mayıs 2021','source':'https://www.florim.com/en/journal/news/il-green-good-design-award-premia-il-design-sostenibile-di-sensi','collection':'https://www.florim.com/en/products/all-collections/sensi','image':'sensi-1600.webp','width':1600,'height':1066,'alt':'Matteo Thun & Partners tasarımı Florim Sensi yüzey uygulaması','story':'Sensi, nötr tonları ve mineral dokuları üzerinden yüzey ile ışığın ilişkisini araştırıyor. Florim’in resmi koleksiyon bilgilerine göre yüzeyler yüzde 90’ın üzerinde doğal ham madde ve yüzde 41’e varan geri dönüştürülmüş içerik kullanıyor.','awardStory':'Sensi, 28 ülkeden katılımın olduğu Green Good Design değerlendirmesinde çevresel duyarlılığı ve tasarım yaklaşımıyla ödüllendirildi. Florim, üretiminde sürdürülebilirlik ve enerji verimliliğini vurguluyor.','products':[],'officialImage':'https://www.florim.com/_next/image?q=75&url=https%3A%2F%2Fwww.florim.com%2Fd%2Ffiler%2Fcanonical%2F1724252052%2F1038%2F&w=1920','officialAlt':'Florim’in Sensi koleksiyonundan resmî dış mekân ödül görseli'},
]

# Create responsive, optimized WebP files only for authentic local matching surface samples.
for record in awards:
    record['gallery'] = []
    for product_id in record['products']:
        product = by_id[product_id]
        source = ROOT / product['mainImage']['source']
        with Image.open(source) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            original_size = im.size
            im.thumbnail((1200,1200), Image.Resampling.LANCZOS)
            filename = f"{record['slug']}-{product_id}.webp"
            im.save(OUT / filename, 'WEBP', quality=84, method=6)
        record['gallery'].append({'src':f'../../../assets/optimized/florim/award-surfaces/{filename}','alt':f"{product['name']} Florim porselen yüzeyi",'title':product['name'],'productHref':f"../../index.html?urun={quote(product['slug'])}",'width':original_size[0],'height':original_size[1]})
    record['heroSrc'] = f"../../../assets/optimized/florim/awards/{record['image']}"

(ROOT / 'florim/oduller/awards.json').write_text(json.dumps(awards,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def esc(s): return html.escape(str(s), quote=True)
def render(r, index):
    base = '../../../'
    canonical = f"https://kemalsarac.github.io/bekamar.github.io/florim/oduller/{r['slug']}/"
    previous = awards[index-1] if index else None
    following = awards[index+1] if index < len(awards)-1 else None
    pictures = []
    for n,g in enumerate(r['gallery']):
        pictures.append(f'''<figure class="award-detail__surface"><button class="award-lightbox-trigger" type="button" data-lightbox-src="{esc(g['src'])}" data-lightbox-alt="{esc(g['alt'])}" aria-label="{esc(g['title'])} görselini büyüt"><img src="{esc(g['src'])}" alt="{esc(g['alt'])}" width="{g['width']}" height="{g['height']}" loading="lazy" decoding="async"><span class="award-detail__surface-index">0{n+1}</span></button><figcaption><span>{esc(g['title'])}</span><a href="{esc(g['productHref'])}">Kataloğumuzda inceleyin <span aria-hidden="true">↗</span></a></figcaption></figure>''')
    local_gallery = '\n'.join(pictures)
    gallery_html = f'''<section class="award-detail__surfaces" aria-labelledby="surfaces-title"><div class="award-detail__section-heading"><p class="eyebrow">YÜZEY SEÇKİSİ</p><h2 id="surfaces-title">Malzemenin yakından görünümü</h2><p>Bekamar Florim kataloğunda yer alan, koleksiyonla eşleşen yüzey örnekleri.</p></div><div class="award-detail__surface-grid">{local_gallery}</div></section>''' if pictures else ''
    official_feature = ''
    if not pictures:
        official_feature = f'''<figure class="award-detail__official-image"><button class="award-lightbox-trigger" type="button" data-lightbox-src="{esc(r['officialImage'])}" data-lightbox-alt="{esc(r['officialAlt'])}" aria-label="Koleksiyon görselini büyüt"><img src="{esc(r['officialImage'])}" alt="{esc(r['officialAlt'])}" width="1920" height="1080" loading="lazy" decoding="async"></button><figcaption>Florim’in resmî koleksiyon görseli</figcaption></figure>'''
    prev_link = f'<a class="award-detail__adjacent" rel="prev" href="../{previous["slug"]}/"><small>ÖNCEKİ ÖDÜL</small><span>← {esc(previous["name"])}</span></a>' if previous else '<span class="award-detail__adjacent is-disabled"><small>ÖNCEKİ ÖDÜL</small><span>İlk içerik</span></span>'
    next_link = f'<a class="award-detail__adjacent award-detail__adjacent--next" rel="next" href="../{following["slug"]}/"><small>SONRAKİ ÖDÜL</small><span>{esc(following["name"])} →</span></a>' if following else '<span class="award-detail__adjacent award-detail__adjacent--next is-disabled"><small>SONRAKİ ÖDÜL</small><span>Son içerik</span></span>'
    hero_label = r.get('heroLabel', 'FLORIM / \u00d6D\u00dcLL\u00dc KOLEKS\u0130YONLAR')
    hero_lead = r.get('heroLead', r['story'])
    collection_cta = r.get('collectionCta', 'Florim koleksiyonunu ke\u015ffet')
    title = f"{r['name']} — {r['award']} {r['year']} | Bekamar"
    description = f"{r['name']} koleksiyonunun {r['award']} {r['year']} başarısını, tasarım hikâyesini ve Florim yüzeylerini Bekamar’da keşfedin."
    breadcrumb = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Ana sayfa','item':'https://kemalsarac.github.io/bekamar.github.io/'},{'@type':'ListItem','position':2,'name':'Florim','item':'https://kemalsarac.github.io/bekamar.github.io/florim/'},{'@type':'ListItem','position':3,'name':'Ödüllü Koleksiyonlar','item':'https://kemalsarac.github.io/bekamar.github.io/florim/#florim-awards'},{'@type':'ListItem','position':4,'name':r['name'],'item':canonical}]}
    article = {'@context':'https://schema.org','@type':'Article','headline':f"{r['name']} — {r['award']} {r['year']}",'description':description,'datePublished':r['date'],'author':{'@type':'Organization','name':'Bekamar'},'publisher':{'@type':'Organization','name':'Bekamar'},'mainEntityOfPage':canonical,'image':f"https://kemalsarac.github.io/bekamar.github.io/assets/optimized/florim/awards/{r['image']}"}
    product_json = json.dumps({'@context':'https://schema.org','@type':'Product','name':r['name'],'brand':{'@type':'Brand','name':'Florim'},'image':article['image'],'url':r['collection'],'description':r['story']},ensure_ascii=False)
    return f'''<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f1eb">
  <title>{esc(title)}</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{canonical}">
  <meta property="og:type" content="article"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="https://kemalsarac.github.io/bekamar.github.io/assets/optimized/florim/awards/{r['image']}"><meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../css/style.css"><link rel="stylesheet" href="../../../css/company.css"><link rel="stylesheet" href="../../../css/splash.css"><link rel="stylesheet" href="../../florim.css"><link rel="stylesheet" href="../../florim-redesign.css"><link rel="stylesheet" href="../award-detail.css">
  <script type="application/ld+json">{json.dumps(breadcrumb,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(article,ensure_ascii=False)}</script><script type="application/ld+json">{product_json}</script>
</head>
<body class="company-page florim-page award-detail-page" data-asset-prefix="../../../" data-company-path="../../../sirketimiz/index.html" data-catalog-brand="Florim" data-product-noun="porselen yüzey" data-catalog-products="../../../assets/optimized/florim/products.json">
  <header class="site-header pad"><a class="brand" href="../../../index.html" aria-label="Bekamar ana sayfa"><picture class="site-image-picture"><source type="image/avif" srcset="../../../assets/optimized/site/bekamarlogo-transparent-800.avif 800w, ../../../assets/optimized/site/bekamarlogo-transparent-1600.avif 1600w" sizes="175px"><source type="image/webp" srcset="../../../assets/optimized/site/bekamarlogo-transparent-800.webp 800w, ../../../assets/optimized/site/bekamarlogo-transparent-1600.webp 1600w" sizes="175px"><img src="../../../assets/images/bekamarlogo-transparent.png" alt="BEKAMAR" width="1983" height="793" decoding="async" fetchpriority="high"></picture></a>
    <nav class="nav" id="nav" aria-label="Ana menü"><a href="../../../index.html#urunler">ANASAYFA</a><a href="../../../sirketimiz/index.html" data-menu="corporate" aria-haspopup="true" aria-expanded="false" aria-controls="megaMenu">KURUMSAL</a><a href="../../../granit/index.html" data-menu="natural" aria-haspopup="true" aria-expanded="false" aria-controls="megaMenu">DOĞAL TAŞLAR</a><a href="../../../sirketimiz/index.html#kompoze-urunler" data-menu="engineered" aria-haspopup="true" aria-expanded="false" aria-controls="megaMenu" aria-current="page">MARKALARIMIZ</a><a href="../../../blog/index.html">BLOG</a><a href="../../../kataloglar/index.html" data-menu="media" aria-haspopup="true" aria-expanded="false" aria-controls="megaMenu">MEDYA</a><a href="../../../bize-ulasin/index.html">İLETİŞİM</a><div class="mobile-submenus" id="mobileSubmenus"></div></nav>
    <div class="header-end"><a class="btn btn--sm" href="mailto:info@bekamar.com"><span>BİZE ULAŞIN</span></a><button class="round menu-btn" id="menuBtn" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">☰</button></div>
  </header><div class="mega-menu" id="megaMenu" aria-label="Alt menü" aria-hidden="true"></div>
  <main class="award-detail">
    <nav class="seo-breadcrumb award-detail__breadcrumb" aria-label="Sayfa yolu"><ol><li><a href="../../../index.html">Ana sayfa</a></li><li><a href="../../index.html">Florim</a></li><li><a href="../../index.html#florim-awards">Ödüllü Koleksiyonlar</a></li><li aria-current="page">{esc(r['name'])}</li></ol></nav>
    <section class="award-detail__hero" aria-labelledby="award-title"><div class="award-detail__hero-copy"><p class="eyebrow">{esc(hero_label)} <span>{index+1:02d} / 06</span></p><p class="award-detail__award-name">{esc(r['award'])}</p><p class="award-detail__year">{esc(r['year'])}</p><h1 id="award-title">{esc(r['name'])}</h1><p class="award-detail__lead">{esc(hero_lead)}</p><a class="award-detail__underlink" href="{esc(r['collection'])}" target="_blank" rel="noopener noreferrer">{esc(collection_cta)} <span aria-hidden="true">↗</span></a></div><figure class="award-detail__hero-media"><button class="award-lightbox-trigger" type="button" data-lightbox-src="{esc(r['heroSrc'])}" data-lightbox-alt="{esc(r['alt'])}" aria-label="{esc(r['name'])} görselini büyüt"><img src="{esc(r['heroSrc'])}" alt="{esc(r['alt'])}" width="{r['width']}" height="{r['height']}" fetchpriority="high" decoding="async"><span class="award-detail__image-caption">FLORIM · {esc(r['name'])}</span></button></figure></section>
    <section class="award-detail__facts" aria-label="Ödül ve tasarım bilgileri"><div><span>ÖDÜL</span><strong>{esc(r['award'])}</strong></div><div><span>YIL</span><strong>{esc(r['year'])}</strong></div><div><span>TASARIM</span><strong>{esc(r['designer'])}</strong><small>{esc(r['role'])}</small></div><div><span>DUYURU TARİHİ</span><strong>{esc(r['date'])}</strong></div></section>
    <section class="award-detail__story"><div><p class="eyebrow">KOLEKSİYONUN HİKÂYESİ</p><h2>Malzemenin dili,<br><em>tasarımın izinde.</em></h2></div><div class="award-detail__story-copy"><p>{esc(r['story'])}</p><p>{esc(r['awardStory'])}</p><a class="award-detail__source" href="{esc(r['source'])}" target="_blank" rel="noopener noreferrer">Florim’in resmî ödül duyurusu <span aria-hidden="true">↗</span></a><p class="award-detail__source-note">Ödül bilgileri Florim’in resmî duyurusuna dayanmaktadır.</p></div></section>
    {gallery_html}{official_feature}
    <section class="award-detail__cta"><div><p class="eyebrow">BEKAMAR / FLORIM</p><h2>Projeye uygun yüzeyi<br>birlikte keşfedelim.</h2></div><div><p>Florim koleksiyonu hakkında ürün, yüzey ve numune bilgisi için Bekamar ekibine ulaşın.</p><a href="../../../bize-ulasin/index.html" class="award-detail__underlink">Bekamar ile iletişime geç <span aria-hidden="true">↗</span></a></div></section>
    <nav class="award-detail__pager" aria-label="Diğer ödüller">{prev_link}<a class="award-detail__all" href="../../index.html#florim-awards">Tüm ödüllü koleksiyonlar <span aria-hidden="true">↑</span></a>{next_link}</nav>
  </main>
  <footer class="site-footer pad company-footer"><a class="brand brand--footer" href="../../../index.html" aria-label="Bekamar ana sayfa"><img src="../../../assets/optimized/site/bekamarlogo-transparent-800.webp" alt="BEKAMAR" width="800" height="320" loading="lazy"></a><nav class="nav" aria-label="Alt menü"><a href="../../../index.html#urunler">ANASAYFA</a><a href="../../../sirketimiz/index.html">KURUMSAL</a><a href="../../../granit/index.html">DOĞAL TAŞLAR</a><a href="../../../kompoze-urunler/index.html">MARKALARIMIZ</a><a href="../../../blog/index.html">BLOG</a><a href="../../../kataloglar/index.html">MEDYA</a><a href="../../../bize-ulasin/index.html">İLETİŞİM</a></nav><small>© BEKAMAR</small></footer>
  <dialog class="award-lightbox" aria-label="Görsel görüntüleyici"><button class="award-lightbox__close" type="button" aria-label="Görseli kapat">×</button><img alt=""></dialog>
  <script src="../../../js/navigation.js" defer></script><script src="../award-detail.js" defer></script>
</body></html>'''

for i,r in enumerate(awards):
    folder=ROOT/'florim'/'oduller'/r['slug']
    folder.mkdir(parents=True,exist_ok=True)
    (folder/'index.html').write_text(render(r,i),encoding='utf-8')

# Add one stretched, keyboard-accessible detail link to every existing carousel card.
page=ROOT/'florim/index.html'
s=page.read_text(encoding='utf-8')
card_pattern=re.compile(r'(<article class="florim-award-card(?: florim-award-card--reverse)?" aria-label="([^"]*)">)(.*?)(</article>)',re.S)
position=0
def add_detail_link(match):
    global position
    if position >= len(awards): raise SystemExit('Expected six award cards in florim/index.html')
    r=awards[position]
    position += 1
    opening, label, body, closing=match.groups()
    if r['name'].split(' ?')[0] not in html.unescape(label):
        if r['slug'] != 'segnature-cedit' or 'Segnature' not in html.unescape(label):
            raise SystemExit('Award card order mismatch: ' + r['name'] + ' vs ' + label)
    target = 'href="oduller/' + r['slug'] + '/"'
    if target not in body:
        link = '<a class="florim-award-card__detail-link" ' + target + ' aria-label="' + esc(r['name']) + ' \u00d6d\u00fcl hik\u00e2yesini incele"><span class="visually-hidden">\u00d6d\u00fcl hik\u00e2yesini incele</span></a>'
        body = link + body
    return opening+body+closing
s=card_pattern.sub(add_detail_link,s)
if position != len(awards): raise SystemExit(f'Expected {len(awards)} award cards, found {position}')
page.write_text(s,encoding='utf-8')
print(f'Generated {len(awards)} static detail pages and optimized {sum(len(a["gallery"]) for a in awards)} matching surface images.')
