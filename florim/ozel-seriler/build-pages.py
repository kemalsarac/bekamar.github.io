from pathlib import Path
import html, json, re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'florim' / 'ozel-seriler'
DATA = [
 {'slug':'oblio','name':'Obl\u00eco','category':'DI\u015e MEK\u00c2N / MOD\u00dcLER TASARIM','designer':'Florim \u00d7 Namui','title':'D\u0131\u015f mek\u00e2nda ya\u015fam alan\u0131','lead':'Florim ve Namui\u2019nin d\u0131\u015f mek\u00e2n i\u00e7in geli\u015ftirdi\u011fi, farkl\u0131 ihtiya\u00e7lara g\u00f6re kurulabilen mod\u00fcler bir ya\u015fam sistemi.','story':'Obl\u00eco, d\u0131\u015f mek\u00e2n\u0131 ya\u015fam alan\u0131n\u0131n do\u011fal bir uzant\u0131s\u0131 olarak ele al\u0131yor. Seramik y\u00fczeyleri; ada ve duvar tipi mutfak mod\u00fclleri, barbek\u00fc ve y\u0131kama \u00fcniteleri, saks\u0131lar, oturma elemanlar\u0131, masa, bank ve ayd\u0131nlatma ile bir araya geliyor. Plug & Play mod\u00fcller farkl\u0131 d\u00fczenlere g\u00f6re birle\u015ftirilebiliyor.','detail':'Florim\u2019in resm\u00ee tan\u0131t\u0131m\u0131nda ta\u015f\u0131y\u0131c\u0131 yap\u0131n\u0131n denizcilik sekt\u00f6r\u00fcnden esinlenen paslanmaz \u00e7elikten \u00fcretildi\u011fi ve d\u0131\u015f ko\u015fullara g\u00f6re tasarland\u0131\u011f\u0131 belirtiliyor. Gizli teknik b\u00f6lmeler ve mod\u00fcler kurgu, tasar\u0131m\u0131n temiz ve b\u00fct\u00fcnl\u00fckl\u00fc g\u00f6r\u00fcn\u00fcm\u00fcn\u00fc destekliyor.','url':'https://www.florim.com/it/prodotti/oblio','imageIds':['1789565741/2316','1789565741/2318','1789636282/2325'],'alts':['Florim ve Namui imzal\u0131 Obl\u00eco d\u0131\u015f mek\u00e2n mutfa\u011f\u0131','Obl\u00eco d\u0131\u015f mek\u00e2n tasar\u0131m\u0131 ve ya\u015fam alan\u0131','Obl\u00eco mod\u00fcler sisteminde malzeme ve i\u015flev detay\u0131']},
 {'slug':'superfici-di-incontro','name':'Superfici d\u2019incontro','category':'MOB\u0130LYA / MASA TASARIMI','designer':'Florim \u00d7 Terzadimensione','title':'Seramik y\u00fczeyle bulu\u015fan masa tasar\u0131mlar\u0131','lead':'Florim\u2019in seramik plakalar\u0131n\u0131 Terzadimensione\u2019nin mobilya uzmanl\u0131\u011f\u0131yla bir araya getiren tasar\u0131m masalar\u0131 koleksiyonu.','story':'Superfici d\u2019incontro; Florim\u2019in seramik plakalar\u0131n\u0131 Terzadimensione\u2019nin mobilya tasar\u0131m\u0131yla bulu\u015fturuyor. Hector, Ambrogio, Mr Big ve Alfred gibi modeller; ah\u015fap ya da metal yap\u0131larla, farkl\u0131 mek\u00e2nlara ve kullan\u0131mlara g\u00f6re tasarlanm\u0131\u015f masa \u00e7\u00f6z\u00fcmleri sunuyor.','detail':'Florim\u2019in resm\u00ee koleksiyon sayfas\u0131nda tasar\u0131mlar Olivieri, TD Studio, Claudio Valentino Design ve ba\u015fka mobilya tasar\u0131mc\u0131lar\u0131yla e\u015fle\u015ftiriliyor. Baz\u0131 modeller i\u00e7 mek\u00e2n, baz\u0131lar\u0131 ise korunakl\u0131 veya soft outdoor kullan\u0131m\u0131 i\u00e7in tarif ediliyor. Y\u00fczey, modelin formuna ve proje tercihine g\u00f6re ki\u015fiselle\u015ftirilebiliyor.','url':'https://www.florim.com/it/prodotti/superfici-di-incontro','imageIds':['1759490446/1739','1759490448/1751','1759490448/1753'],'alts':['Florim seramik y\u00fczeyli Superfici d’incontro tasar\u0131m masas\u0131','Superfici d’incontro koleksiyonundan masa ve seramik tabla detay\u0131','Terzadimensione ve Florim masa koleksiyonundan farkl\u0131 bir tasar\u0131m']},
 {'slug':'kerakoll-x-florim','name':'Kerakoll \u00d7 Florim','category':'RENK / Y\u00dcZEY \u0130\u015e B\u0130RL\u0130KLER\u0130','designer':'Florim \u00d7 Kerakoll','title':'Renk, y\u00fczey ve derz bir arada','lead':'SensiColore\u2019nin 15 rengi i\u00e7in e\u015fle\u015fen Fugabella Color derz se\u00e7eneklerini bulu\u015fturan ortak renk projesi.','story':'Florim ve Kerakoll i\u015f birli\u011fi, seramik y\u00fczeyi, derzi ve duvar rengini birlikte ele al\u0131yor. Projenin oda\u011f\u0131ndaki SensiColore, Matteo Thun & Partners tasar\u0131m\u0131 15 tondan olu\u015fuyor; Kerakoll her renk i\u00e7in uyumlu Fugabella Color derz \u00f6nerisi geli\u015ftirdi.','detail':'Florim\u2019in resm\u00ee sayfas\u0131nda renk e\u015fle\u015fmeleri a\u00e7\u0131k\u00e7a listeleniyor. N\u00f6tr tonlardan mavi, ye\u015fil ve k\u0131rm\u0131z\u0131lara uzanan se\u00e7enekler, derzi yaln\u0131zca birle\u015ftirici bir detay olmaktan \u00e7\u0131kar\u0131p y\u00fczeyle birlikte tasarlanan bir renk bile\u015fenine d\u00f6n\u00fc\u015ft\u00fcr\u00fcyor. Nihai renk uyumunun uygulama \u00f6ncesinde numuneyle kontrol edilmesi gerekir.','url':'https://www.florim.com/it/prodotti/kerakoll-x-florim','localImage':'assets/optimized/florim/special-series/kerakoll-florim-1200.webp','localCardImage':'assets/optimized/florim/special-series/kerakoll-florim-800.webp','localAlt':'Kerakoll ve Florim SensiColore tonlar\u0131 ve uyumlu Fugabella Color derz e\u015fle\u015fmeleri','localWidth':1200,'localHeight':858,'imageIds':['1789480377/2293','1789544847/2296'],'alts':['Florim ve Kerakoll’un renk ve yüzey birlikteliğini tanıtan görsel','Kerakoll x Florim Fugabella Color ve SensiColore eşleşmeleri']},
 {'slug':'elitique','name':'Elitique','category':'BANYO / TASARIM \u0130\u015e B\u0130RL\u0130KLER\u0130','designer':'Florim \u00d7 Falper','title':'Seramik ve ah\u015fab\u0131 bulu\u015fturan banyo sistemi','lead':'Florim ve Falper’in seramik y\u00fczeyleri ile banyo mobilyalar\u0131n\u0131 birle\u015ftiren tasar\u0131m i\u015f birli\u011fi.','story':'Florim’in resm\u00ee marka sayfas\u0131 Elitique’i, tasar\u0131m ve yenilik\u00e7i malzemeler alan\u0131nda iki markan\u0131n i\u015f birli\u011fi olarak tan\u0131ml\u0131yor. Proje; ah\u015fap ve porselen ta\u015f\u0131n\u0131 birlikte kullanan bir banyo sistemi geli\u015ftirme hedefiyle ortaya \u00e7\u0131kt\u0131.','detail':'Florim y\u00fczeyleri Falper mobilyalar\u0131yla e\u015fle\u015ferek lavabo ve banyo mobilyalar\u0131 gibi uygulamalar olu\u015fturuyor. Elitique bu nedenle tek bir seramik koleksiyonundan ziyade, iki markan\u0131n malzeme ve tasar\u0131m\u0131n\u0131 bir araya getiren banyo projesi olarak sunuluyor.','url':'https://www.florim.com/en/company/brand/elitique','imageIds':['1747125507/1586','1747126215/1592','1747125640/1590'],'alts':['Florim Elitique lüks banyo tasar\u0131m\u0131','Elitique lavabo ve seramik y\u00fczey yak\u0131n detay\u0131','Elitique tasar\u0131m\u0131n\u0131n showroom uygulamas\u0131']},
]

GROUTS = [
 {'code':'KK 1422','color':'Bianco','imageId':'1789544847/2296'}, {'code':'KK 1424','color':'Grigio','imageId':'1789544848/2299'}, {'code':'KK 1339','color':'Tortora','imageId':'1789544847/2297'},
 {'code':'KK 4092','color':'Avorio','imageId':'1789544849/2305'}, {'code':'KK 6216','color':'Rosa','imageId':'1789544849/2309'}, {'code':'KK 8368','color':'Vino','imageId':'1789544849/2310'},
 {'code':'KK 5249','color':'Miele','imageId':'1789544849/2306'}, {'code':'KK 5190','color':'Cammello','imageId':'1789544849/2307'}, {'code':'KK 6161','color':'Marrone','imageId':'1789544849/2308'},
 {'code':'KK 3424','color':'Salvia','imageId':'1789544848/2304'}, {'code':'KK 3458','color':'Muschio','imageId':'1789544848/2303'}, {'code':'KK 3069','color':'Bosco','imageId':'1789544848/2302'},
 {'code':'KK 1123','color':'Ceruleo','imageId':'1789544847/2298'}, {'code':'KK 2307','color':'Laguna','imageId':'1789544848/2300'}, {'code':'KK 2490','color':'Blunotte','imageId':'1789544848/2301'},
]

KERAKOLL_COPY = {
 'title':'Renk bir tasarıma dönüşüyor',
 'lead':'Florim ve Kerakoll’un buluşmasından, mekânın ifade olanaklarını genişletmek için seramik yüzey, derz ve duvarı bir araya getiren renge adanmış bir proje doğuyor.',
 'story':'İş birliği, Matteo Thun & Partners imzalı SensiColore koleksiyonu etrafında şekilleniyor. İtalyan manzaralarından ilham alan 15 ton, renkler arasında bir yolculuk sunuyor.',
 'detail':'Kerakoll, SensiColore’nin 15 renginin her biri için seramik yüzeylerde kullanılmak üzere dekoratif reçine-çimento esaslı Fugabella Color derz eşleşmesi geliştirdi. Florim için özel olarak hazırlanan tonlar; nötr renklerden mavi, yeşil, kırmızı ve grilere uzanıyor. Yüzeyle ton sür ton uyum sağlayan bu eşleşmelerde derz, yalnızca birleştirici bir detay değil; mekânın bütünlüğüne katkıda bulunan tasarımın bir parçası.',
}

# Verified model descriptions from Florim's Superfici d'incontro collection page.
SUPERFICI_MODELS = [
 ('Hector','Olivieri','Merkezdeki metal bağlantı ahşap taşıyıcıyla birleşir; 12 mm Florim seramik tablası projeye göre kişiselleştirilebilir.'),
 ('Ambrogio','Olivieri','İki ölçü seçeneği ve açılır tabla sistemi sunar. Meşe kaplamalı taşıyıcı, Florim yüzeyle tamamlanır.'),
 ('Mr Big','Olivieri','Yumuşak hatlı tablası, ikonik yuvarlatılmış kenar formunu seramik yüzey detayıyla buluşturur.'),
 ('Alfred','Olivieri','Dış mekân masa ve bank çözümüdür; metal taşıyıcı, ahşap detaylar ve porselen taş kaplamalı yüzeylerden oluşur.'),
 ('Kairos','Olivieri','Mr Big’in eliptik formunu ve kesik konik ayağını yeniden yorumlar; 12 mm seramik tabla biçimlendirilmiş kenarla sunulur.'),
 ('Origine','Olivieri','Çapraz taşıyıcı yapıyı, farklı biçim ve yüzeylerde seramik tablalarla bir araya getirir.'),
 ('Cross','TD Studio','Geometrik taşıyıcılı dış mekân tasarımıdır; 12 ve 20 mm tabla seçenekleri bulunur.'),
 ('Magnum','TD Studio','Kolon biçimli ayağıyla tanımlanır; 160 × 320 cm’ye kadar ve 20 mm kalınlıkta tabla seçenekleri sunar.'),
 ('Filo','TD Studio','İnce metal iskelet ve 12 mm Florim seramik tablayla hafif bir görünüm oluşturur.'),
 ('Oto Pop','Claudio Valentino Design','Geometrik taşıyıcıyı ince metal ayaklar ve farklı biçimlerdeki tablalarla birleştiren yalın tasarım.'),
 ('Oto Pop Reverse','Claudio Valentino Design','Seramik tablayı taşıyan metal bağlantı detayları tasarımın görünür bir parçası olur; farklı tabla biçimleri ve yüzeyler sunulur.'),
 ('Oto Rock','Claudio Valentino Design','Heykelsi ve keskin geometrili tabanı 12 mm seramikle tamamlanır; ayaklar da seramikle kaplanabilir.'),
 ('Komos','LATOxLATO Design','20 mm seramik elemanlardan oluşan konik taban, uyumlu veya kontrast renklerle farklı geometrilerde tasarlanır.'),
 ('Torii','Pier Luca Freschi Design','Dengeli, düz çizgileri 12 mm Florim seramik tabla ile buluşturur.'),
 ('Spider','TD Studio','Hafif doğrusal taşıyıcı, yumuşak biçimli 12 mm tabla ve kanat profilli kenar detayıyla tamamlanır.'),
]
SUPERFICI_IMAGE_SLUGS = ['hector','ambrogio','mr-big','alfred','kairos','origine','cross','magnum','filo','oto-pop','oto-pop-reverse','oto-rock','komos','torii','spider']
SUPERFICI_IMAGE_MANIFEST = json.loads((ROOT/'assets/optimized/florim/special-series/superfici-models-manifest.json').read_text(encoding='utf-8'))

def superfici_image_paths(index):
    record=SUPERFICI_IMAGE_MANIFEST[index]
    small,large=record['webp']
    return '../../../'+small['path'], '../../../'+large['path'], small['width'], small['height']

def superfici_models_section():
    cards=[]
    for i,(name,designer,description) in enumerate(SUPERFICI_MODELS):
        src,full,img_width,img_height=superfici_image_paths(i)
        alt=f"Florim {name} seramik tablal&#305; tasar&#305;m masas&#305;"
        cards.append(f'<article class="series-model"><button class="award-lightbox-trigger series-model__image" type="button" data-lightbox-src="{esc(full)}" data-lightbox-alt="{alt}" aria-label="{alt} g&#246;rselini b&#252;y&#252;t"><img src="{esc(src)}" alt="{alt}" width="{img_width}" height="{img_height}" loading="lazy" decoding="async"></button><p class="series-model__designer">{esc(designer)}</p><h3>{esc(name)}</h3><p>{esc(description)}</p></article>')
    return '<section class="series-models" aria-labelledby="series-models-title"><header><p class="eyebrow">SUPERFICI D&#8217;INCONTRO / MODEL SE&#199;K&#304;S&#304;</p><h2 id="series-models-title">Farkl&#305; mek&#226;nlara g&#246;re tasarlanan masalar</h2><p>Florim seramik y&#252;zeyleri ve Terzadimensione mobilya tasar&#305;m&#305;, i&#231; ve d&#305;&#351; mek&#226;n kullan&#305;mlar&#305;na y&#246;nelik farkl&#305; masa modellerinde bulu&#351;uyor.</p></header><div class="series-models__grid">'+''.join(cards)+'</div></section>'

for _item in DATA:
    if _item['slug']=='kerakoll-x-florim':
        _item.update(KERAKOLL_COPY)
        _item['localImage']='assets/optimized/florim/special-series/kerakoll-colour-story-1600.webp'
        _item['localCardImage']='assets/optimized/florim/special-series/sensicolore-feature-800.webp'
        _item['localAlt']='Florim ve Kerakoll için hazırlanan SensiColore ve Fugabella Color paletinden renk örnekleri'
        _item['localWidth']=1600; _item['localHeight']=1600
        _item['imageIds']=['1789480935/2295','1789546237/2311']
        _item['alts']=['SensiColore ile Fugabella Color tonlarının renk örnekleri','Florim SensiColore koleksiyonunun mimari uygulaması']

KERAKOLL_IMAGE_ASSETS = {
 '1789480935/2295':'kerakoll-colour-story',
 '1789546237/2311':'sensicolore-feature',
 **{row['imageId']:'kerakoll-'+row['code'].lower().replace(' ','-') for row in GROUTS},
}
KERAKOLL_MANIFEST = json.loads((ROOT/'assets/optimized/florim/special-series/kerakoll-manifest.json').read_text(encoding='utf-8'))
SERIES_IMAGE_ASSETS = {
    '1789565741/2316':'series-oblio-main',
    '1789565741/2318':'series-oblio-detail-2',
    '1789636282/2325':'series-oblio-detail-3',
    '1759490446/1739':'series-superfici-main',
    '1759490448/1751':'series-superfici-detail-2',
    '1759490448/1753':'series-superfici-detail-3',
    '1747125507/1586':'series-elitique-main',
    '1747126215/1592':'series-elitique-detail-2',
    '1747125640/1590':'series-elitique-detail-3',
}

def local_florim_image(asset, edge=900):
    record=KERAKOLL_MANIFEST[asset]
    variant=min(record['webp'],key=lambda row: abs(row['width']-edge))
    return '../../../'+variant['path'],variant['width'],variant['height']

def esc(value): return html.escape(str(value), quote=True)
def image_url(image_id, width=1920):
    original='https://www.florim.com/d/filer/canonical/'+image_id+'/'
    return 'https://www.florim.com/_next/image?q=75&url='+quote(original,safe='')+'&w='+str(width)

def render(item, index):
    slug=item['slug']; title=f"{item['name']} | Florim özel seriler | Bekamar"
    is_kerakoll=slug=='kerakoll-x-florim'
    canonical=f"https://kemalsarac.github.io/bekamar.github.io/florim/ozel-seriler/{slug}/"
    hero='../../../'+item['localImage'] if item.get('localImage') else image_url(item['imageIds'][0],1920)
    if item['imageIds'][0] in SERIES_IMAGE_ASSETS:
        hero,hero_width,hero_height=local_florim_image(SERIES_IMAGE_ASSETS[item['imageIds'][0]],1600)
        item['localImage']=hero.removeprefix('../../../')
        hero_meta='https://kemalsarac.github.io/bekamar.github.io/'+item['localImage']
    hero_meta='https://kemalsarac.github.io/bekamar.github.io/'+item['localImage'] if item.get('localImage') else hero
    hero_alt=item.get('localAlt',item['alts'][0])
    hero_width=item.get('localWidth',1920); hero_height=item.get('localHeight',1080)
    story=[]
    for i,(image_id,alt) in enumerate(zip(item['imageIds'],item['alts']),1):
        if is_kerakoll or image_id in SERIES_IMAGE_ASSETS:
            asset=KERAKOLL_IMAGE_ASSETS[image_id] if is_kerakoll else SERIES_IMAGE_ASSETS[image_id]
            src,img_width,img_height=local_florim_image(asset,900)
            full_src,_,_=local_florim_image(asset,1600)
        else:
            src=image_url(image_id,1920); full_src=src; img_width=1920; img_height=1080
        if is_kerakoll or image_id in SERIES_IMAGE_ASSETS:
            story.append(f'<figure class="award-detail__surface"><button class="award-lightbox-trigger" type="button" data-lightbox-src="{esc(full_src)}" data-lightbox-alt="{esc(alt)}" aria-label="{esc(alt)} görselini büyüt"><img src="{esc(src)}" alt="{esc(alt)}" width="{img_width}" height="{img_height}" loading="lazy" decoding="async"><span class="award-detail__surface-index">{i:02d}</span></button><figcaption><span>{esc(alt)}</span></figcaption></figure>')
    grout_section=''
    if item['slug']=='kerakoll-x-florim':
        grout_cards=[]
        for i, grout in enumerate(GROUTS,1):
            asset=KERAKOLL_IMAGE_ASSETS[grout['imageId']]
            src,img_width,img_height=local_florim_image(asset,900); full,_,_=local_florim_image(asset,1600)
            code=grout['code']; color=grout['color']
            alt=f"Kerakoll Fugabella Color {grout['code']} ve SensiColore {grout['color']} eşleşmesi"
            grout_cards.append(f'<article class="florim-grout-card"><button class="award-lightbox-trigger florim-grout-card__image" type="button" data-lightbox-src="{esc(full)}" data-lightbox-alt="{esc(alt)}" aria-label="{esc(alt)} görselini büyüt"><img src="{esc(src)}" alt="{esc(alt)}" width="{img_width}" height="{img_height}" loading="lazy" decoding="async"><span class="florim-grout-card__index">{i:02d}</span></button><div class="florim-grout-card__copy"><p>FUGABELLA COLOR</p><h3>{esc(code)}</h3><p class="florim-grout-card__tone">SensiColore <strong>{esc(color)}</strong></p></div></article>')
        feature_src,feature_width,feature_height=local_florim_image('sensicolore-feature',1600)
        grout_section=f'<section class="florim-collaboration-film" aria-label="Kerakoll ve Florim renk projesi filmi"><div><iframe src="https://www.youtube.com/embed/Ip95XBCnPek?rel=0" title="Kerakoll × Florim — renk bir tasarıma dönüşüyor" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></section><section class="florim-sensicolore-feature" aria-labelledby="florim-sensicolore-title"><figure><img src="{esc(feature_src)}" alt="Matteo Thun &amp; Partners tasarımı SensiColore koleksiyonundan yüzey ve renk uygulaması" width="{feature_width}" height="{feature_height}" loading="lazy" decoding="async"><figcaption id="florim-sensicolore-title"><span>SENSICOLORE</span><span>MATTEO THUN &amp; PARTNERS</span></figcaption></figure></section><section class="florim-grout-range" aria-labelledby="florim-grout-title"><div class="florim-grout-range__heading"><p class="eyebrow">KERAKOLL × FLORIM / RENK EŞLEŞMELERİ</p><h2 id="florim-grout-title">Her renk için uyumlu derz</h2><p>15 SensiColore tonu için Florim ve Kerakoll’un birlikte geliştirdiği Fugabella Color eşleşmeleri.</p></div><div class="florim-grout-range__grid">{"".join(grout_cards)}</div></section>'
    structured={'@context':'https://schema.org','@type':'CollectionPage','name':item['name'],'description':item['lead'],'url':canonical,'image':hero_meta,'isPartOf':{'@type':'WebSite','name':'Bekamar','url':'https://kemalsarac.github.io/bekamar.github.io/'}}
    breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Ana sayfa','item':'https://kemalsarac.github.io/bekamar.github.io/'},{'@type':'ListItem','position':2,'name':'Florim','item':'https://kemalsarac.github.io/bekamar.github.io/florim/'},{'@type':'ListItem','position':3,'name':'Özel seriler','item':'https://kemalsarac.github.io/bekamar.github.io/florim/#florim-specials'},{'@type':'ListItem','position':4,'name':item['name'],'item':canonical}]}
    page=f'''<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f1eb"><title>{esc(title)}</title><meta name="description" content="{esc(item['lead'])}"><link rel="canonical" href="{canonical}"><meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(item['lead'])}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{esc(hero_meta)}"><meta name="twitter:card" content="summary_large_image"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="../../../css/style.css"><link rel="stylesheet" href="../../../css/company.css"><link rel="stylesheet" href="../../../css/splash.css"><link rel="stylesheet" href="../../florim.css"><link rel="stylesheet" href="../../florim-redesign.css"><link rel="stylesheet" href="../../oduller/award-detail.css"><script type="application/ld+json">{json.dumps(breadcrumb,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(structured,ensure_ascii=False)}</script></head>
<body class="company-page florim-page award-detail-page"><header class="site-header pad"><a class="brand" href="../../../index.html" aria-label="Bekamar ana sayfa"><img src="../../../assets/optimized/site/bekamarlogo-transparent-800.webp" alt="BEKAMAR" width="800" height="320" fetchpriority="high"></a><nav class="nav" id="nav" aria-label="Ana menü"><a href="../../../index.html#urunler">ANASAYFA</a><a href="../../../sirketimiz/index.html">KURUMSAL</a><a href="../../../granit/index.html">DOĞAL TAŞLAR</a><a href="../../../sirketimiz/index.html#kompoze-urunler" aria-current="page">MARKALARIMIZ</a><a href="../../../blog/index.html">BLOG</a><a href="../../../kataloglar/index.html">MEDYA</a><a href="../../../bize-ulasin/index.html">İLETİŞİM</a></nav><div class="header-end"><a class="btn btn--sm" href="mailto:info@bekamar.com"><span>BİZE ULAŞIN</span></a><button class="round menu-btn" id="menuBtn" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">☰</button></div></header><div class="mega-menu" id="megaMenu" aria-label="Alt menü" aria-hidden="true"></div>
<main class="award-detail"><nav class="seo-breadcrumb award-detail__breadcrumb" aria-label="Sayfa yolu"><ol><li><a href="../../../index.html">Ana sayfa</a></li><li><a href="../../index.html">Florim</a></li><li><a href="../../index.html#florim-specials">Özel seriler</a></li><li aria-current="page">{esc(item['name'])}</li></ol></nav><section class="award-detail__hero" aria-labelledby="series-title"><div class="award-detail__hero-copy"><p class="eyebrow">{esc(item['category'])} <span>· {index+1:02d} / 04</span></p><p class="award-detail__award-name">{esc(item['designer'])}</p><h1 id="series-title">{esc(item['name'])}</h1><p class="award-detail__lead">{esc(item['lead'])}</p><a class="award-detail__underlink" href="{esc(item['url'])}" target="_blank" rel="noopener noreferrer">Florim’in resmî sayfasını inceleyin <span aria-hidden="true">↗</span></a></div><figure class="award-detail__hero-media"><button class="award-lightbox-trigger" type="button" data-lightbox-src="{esc(hero)}" data-lightbox-alt="{esc(item['alts'][0])}" aria-label="{esc(item['alts'][0])} görselini büyüt"><img src="{esc(hero)}" alt="{esc(item['alts'][0])}" width="1920" height="1080" fetchpriority="high" decoding="async"><span class="award-detail__image-caption">FLORIM · {esc(item['name'])}</span></button></figure></section><section class="award-detail__story"><div><p class="eyebrow">SERİ / TASARIM YAKLAŞIMI</p><h2>{esc(item['title'])}</h2></div><div class="award-detail__story-copy"><p>{esc(item['story'])}</p><p>{esc(item['detail'])}</p></div></section><section class="award-detail__surfaces" aria-labelledby="gallery-title"><div class="award-detail__section-heading"><p class="eyebrow">FLORIM / GÖRSEL SEÇKİSİ</p><h2 id="gallery-title">Seriyi yakından keşfedin</h2><p>Resmî Florim görselleri. Görseli seçerek büyütebilirsiniz.</p></div><div class="award-detail__surface-grid">{''.join(story)}</div></section><section class="award-detail__cta"><div><p class="eyebrow">BEKAMAR / FLORIM</p><h2>Projeniz için<br>birlikte değerlendirelim.</h2></div><div><p>{esc(item['name'])} hakkında ürün ve proje bilgisi için Bekamar ekibine ulaşın.</p><a href="../../../bize-ulasin/index.html" class="award-detail__underlink">Bekamar ile iletişime geç <span aria-hidden="true">↗</span></a></div></section><nav class="award-detail__pager" aria-label="Özel seriler arasında gezinme"><a class="award-detail__adjacent" href="../../index.html#florim-specials"><small>GERİ DÖN</small><span>Özel seriler</span></a><a class="award-detail__all" href="../../index.html#florim-specials">Tüm özel seriler <span aria-hidden="true">↑</span></a><a class="award-detail__adjacent award-detail__adjacent--next" href="../{esc(next_item['slug'])}/"><small>SONRAK\u0130 \u00d6ZEL SER\u0130</small><span>{esc(next_item['name'])} \u2192</span></a></nav></main><footer class="site-footer pad company-footer"><a class="brand brand--footer" href="../../../index.html" aria-label="Bekamar ana sayfa"><img src="../../../assets/optimized/site/bekamarlogo-transparent-800.webp" alt="BEKAMAR" width="800" height="320" loading="lazy"></a><nav class="nav" aria-label="Alt menü"><a href="../../../index.html#urunler">ANASAYFA</a><a href="../../../sirketimiz/index.html">KURUMSAL</a><a href="../../../granit/index.html">DOĞAL TAŞLAR</a><a href="../../../kompoze-urunler/index.html">MARKALARIMIZ</a><a href="../../../blog/index.html">BLOG</a><a href="../../../kataloglar/index.html">MEDYA</a><a href="../../../bize-ulasin/index.html">İLETİŞİM</a></nav><small>© BEKAMAR</small></footer><dialog class="award-lightbox" aria-label="Görsel görüntüleyici"><button class="award-lightbox__close" type="button" aria-label="Görseli kapat">×</button><img alt=""></dialog><script src="../../../js/navigation.js" defer></script><script src="../../oduller/award-detail.js" defer></script></body></html>'''
    extra_section=''
    if slug=='superfici-di-incontro':
        cards=[]
        for i,(name,designer,description) in enumerate(SUPERFICI_MODELS):
            src,full,img_width,img_height=superfici_image_paths(i)
            alt=f"Florim {name} seramik tablal&#305; tasar&#305;m masas&#305;"
            cards.append(f'<article class="series-model"><button class="award-lightbox-trigger series-model__image" type="button" data-lightbox-src="{esc(full)}" data-lightbox-alt="{alt}" aria-label="{alt} g&#246;rselini b&#252;yüt"><img src="{esc(src)}" alt="{alt}" width="{img_width}" height="{img_height}" loading="lazy" decoding="async"></button><p class="series-model__designer">{esc(designer)}</p><h3>{esc(name)}</h3><p>{esc(description)}</p></article>')
        extra_section='<section class="series-models" aria-labelledby="series-models-title"><header><p class="eyebrow">SUPERFICI D\u2019INCONTRO / MODEL SE\u00c7K\u0130S\u0130</p><h2 id="series-models-title">Farkl\u0131 mek\u00e2nlara g\u00f6re tasarlanan masalar</h2><p>Florim seramik y\u00fczeyleri ve Terzadimensione mobilya tasar\u0131m\u0131, i\u00e7 ve d\u0131\u015f mek\u00e2n kullan\u0131mlar\u0131na y\u00f6nelik farkl\u0131 masa modellerinde bulu\u015fuyor.</p></header><div class="series-models__grid">'+''.join(cards)+'</div></section>'
    document_section=''
    if slug=='oblio':
        document_section='<section class="series-document" aria-labelledby="series-document-title"><div class="series-document__heading"><p class="eyebrow">FLORIM / OBL&#204;O</p><h2 id="series-document-title">Obl&#236;o PDF dosyas&#305;</h2><p>Belgeyi sayfa i&#231;inde g&#246;r&#252;nt&#252;leyin, yeni sekmede a&#231;&#305;n veya indirin.</p><div class="series-document__actions"><a href="../../../assets/obl%C4%B1o.pdf" target="_blank" rel="noopener">PDF?yi yeni sekmede a&#231; <span aria-hidden="true">?</span></a><a href="../../../assets/obl%C4%B1o.pdf" download>PDF?yi indir <span aria-hidden="true">?</span></a></div></div><iframe src="../../../assets/obl%C4%B1o.pdf#view=FitH" title="Obl&#236;o PDF belgesi &#246;n izlemesi" loading="lazy"></iframe></section>'
    elif slug=='superfici-di-incontro':
        document_section='<section class="series-document" aria-labelledby="series-document-title"><div class="series-document__heading"><p class="eyebrow">FLORIM / SUPERFICI D?INCONTRO</p><h2 id="series-document-title">Superfici d?incontro PDF dosyas&#305;</h2><p>Belgeyi sayfa i&#231;inde g&#246;r&#252;nt&#252;leyin, yeni sekmede a&#231;&#305;n veya indirin.</p><div class="series-document__actions"><a href="../../../assets/Superficid%E2%80%99incontro.pdf" target="_blank" rel="noopener">PDF?yi yeni sekmede a&#231; <span aria-hidden="true">?</span></a><a href="../../../assets/Superficid%E2%80%99incontro.pdf" download>PDF?yi indir <span aria-hidden="true">?</span></a></div></div><iframe src="../../../assets/Superficid%E2%80%99incontro.pdf#view=FitH" title="Superfici d?incontro PDF belgesi &#246;n izlemesi" loading="lazy"></iframe></section>'
    page=page.replace('</section><section class="award-detail__surfaces"', '</section>'+grout_section+extra_section+document_section+'<section class="award-detail__surfaces"')
    if is_kerakoll:
        page=page.replace('<h2 id="gallery-title">Seriyi yakından keşfedin</h2><p>Resmî Florim görselleri. Görseli seçerek büyütebilirsiniz.</p>', '<h2 id="gallery-title">Renk ve yüzey birlikteliği</h2><p>Florim’in Kerakoll × Florim ve SensiColore sayfalarındaki görseller.</p>')
    return page

for index,item in enumerate(DATA):
    if item['imageIds'][0] in SERIES_IMAGE_ASSETS:
        hero,hero_width,hero_height=local_florim_image(SERIES_IMAGE_ASSETS[item['imageIds'][0]],1600)
        card,card_width,card_height=local_florim_image(SERIES_IMAGE_ASSETS[item['imageIds'][0]],800)
        item.update(localImage=hero.removeprefix('../../../'),localCardImage=card.removeprefix('../../../'),localWidth=hero_width,localHeight=hero_height,localCardWidth=card_width,localCardHeight=card_height)
    folder=OUT/item['slug']; folder.mkdir(parents=True,exist_ok=True)
    (folder/'index.html').write_text(render(item,index),encoding='utf-8')
(OUT/'series.json').write_text(json.dumps([{**item, **({'grouts':GROUTS} if item['slug']=='kerakoll-x-florim' else {})} for item in DATA],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Refresh the local Florim specials cards with verified copy, official imagery and local detail routes.
if '--pages-only' not in __import__('sys').argv:
    page=ROOT/'florim/index.html'; source=page.read_text(encoding='utf-8')
    start=source.index('<div class="florim-specials__grid">')
    end=source.index('</div><p>',start)+len('</div>')
    card_html=[]
    for item in DATA:
        image='../'+item['localCardImage'] if item.get('localCardImage') else image_url(item['imageIds'][0],1200)
        card_alt=item.get('localAlt',item['alts'][0])
        card_width=item.get('localCardWidth',800 if item.get('localCardImage') else 1200); card_height=item.get('localCardHeight',572 if item.get('localCardImage') else 800)
        card_html.append(f'<a href="ozel-seriler/{item["slug"]}/"><span class="florim-specials__image"><img src="{esc(image)}" alt="{esc(card_alt)}" width="{card_width}" height="{card_height}" loading="lazy" decoding="async"></span><small class="florim-specials__category">{esc(item["category"])}</small><strong>{esc(item["name"])}</strong><span class="florim-specials__description">{esc(item["lead"])}</span><span class="florim-specials__action">Seri hikâyesini keşfedin <b aria-hidden="true">→</b></span></a>')
    new='<div class="florim-specials__grid">'+''.join(card_html)+'</div>'
    source=source[:start]+new+source[end:]
    note_start=source.index('<p>&#304;&#231;erik')
    note_end=source.index('</p>',note_start)+4
    source=source[:note_start]+'<p>&#304;&#231;erik ve g&#246;rseller Florim&#8217;in resm&#238; &#252;r&#252;n ve marka sayfalar&#305;na dayanmaktad&#305;r.</p>'+source[note_end:]
    page.write_text(source,encoding='utf-8')
print('Created 4 verified series detail pages and refreshed the cards.')
