(() => {
  const filterButtons = [...document.querySelectorAll('[data-blog-filter]')];
  const featured = document.getElementById('blogFeatured');
  const grid = document.getElementById('blogGrid');
  const search = document.getElementById('blogSearch');
  const empty = document.getElementById('blogEmpty');
  const count = document.getElementById('blogCount');
  const reader = document.getElementById('blogReader');
  const readerTitle = document.getElementById('blogReaderTitle');
  const readerCategory = document.querySelector('[data-reader-category]');
  const readerBody = document.querySelector('[data-reader-body]');
  const readerImage = reader?.querySelector('.blog-reader__image img');
  const closeButton = document.querySelector('[data-blog-close]');
  if (!featured || !grid || !search || !empty || !count || !reader) return;

  const articles = [
    {
      id: 'kitchen-countertops', title: 'Mutfak Tezgahı Alırken Dikkat Etmeniz Gerekenler',
      category: ['applications', 'guide'], categoryLabel: 'UYGULAMA ÖRNEKLERİ · DOĞAL TAŞ REHBERİ',
      image: 'mutfak.png', alt: 'Doğal taş tezgâhlı modern Bekamar mutfağı',
      excerpt: 'Sık sık değiştiremediğimiz mutfak tezgâhlarımızı yenilemeye karar verdiğimizde pek çok ayrıntıyı göz önünde bulundurmalıyız. Renk, doku, yapı ve mutfağın özellikleri doğru seçimde belirleyici olur.',
      paragraphs: ['Sık sık değiştiremediğimiz mutfak tezgahlarımızı bir kere değiştirmeye karar verdiğimizde her şeyiyle çok dikkat etmemiz gereken hususları vardır. Mutfak tezgahı seçerken; rengine, dokusuna, yapısına, mutfağınızın özelliklere göre birçok farklı maddeleri göz önünde tutarak doğru tercih yapmaya çalışılmalıdır. Yazımızın devamında mutfak tezgahı ile ilgili sorularınızın cevaplarınızı bulabilirsiniz…']
    },
    {
      id: 'black-white-marble', title: 'Mermer Yüzeylerde Siyah ve Beyazın Çekici Dansı!',
      category: ['design'], categoryLabel: 'MİMARİ VE TASARIM',
      image: 'pandawhite.png', alt: 'Siyah ve beyaz damarları bir araya getiren mermer yüzey',
      excerpt: 'Siyah ve beyaz, zıtlıklarıyla birbirini tamamlayan iki güçlü renk. Mermer yüzeylerde bu uyum, mekâna dengeli ve dikkat çekici bir karakter kazandırır.',
      paragraphs: ['Birbirinin zıttı olanların daha çekici geldiği yaşamda bu bir gerçek olarak algılanır. Halbuki bazı düşünürler yaşamda zıtlığın olmadığını söylerler. Onlar için var ile yok, ağlamak ile gülmek, sevgi ile nefret, gece ile gündüz, siyah ile beyaz uyum içerisinde birbirini tamamlayandır.']
    },
    {
      id: 'outdoor-stone', title: 'Dış Mekanlarınızda Doğal Taşlarla Döşeme!',
      category: ['applications', 'design'], categoryLabel: 'UYGULAMA ÖRNEKLERİ · MİMARİ VE TASARIM',
      image: 'dişmekan.png', alt: 'Doğal taş döşemeli açık hava yaşam alanı',
      excerpt: 'Balkon, bahçe ve teraslar yaşam alanlarımızın önemli bir parçası. Bu açık alanların tasarımı da günlük yaşamımızı ve ruh halimizi etkiler.',
      paragraphs: ['Yaşam alanı denilince aklımıza ilk olarak iç mekanlarımız olan yatak odası, mutfak, salon, ofis gelir. Fakat iç mekanlarımızın görselliği kadar dış mekanlarımızın da tasarımı aslında ruh halimizi olumlu ya da olumsuz etkiler. Bunaldığımız zaman çıkıp kahve içtiğimiz balkonumuz, mutlaka sandalye takımımızı eksik etmediğimiz bahçemiz ya da şehrin manzarasını izlediğimiz terasımız bizim için aslında sandığımızdan daha önemlidir.']
    },
    {
      id: 'modern-bathroom', title: 'Modern Banyoda Mermer Kullanımı',
      category: ['applications', 'design'], categoryLabel: 'UYGULAMA ÖRNEKLERİ · MİMARİ VE TASARIM',
      image: 'banyo.png', alt: 'Mermer kaplamalı modern banyo tasarımı',
      excerpt: 'Banyolar günün yorgunluğunu attığımız, ferahlık ve konfor aradığımız özel alanlardır. Doğal taş yüzeyler bu alanlara zamansız bir görünüm kazandırır.',
      paragraphs: [
        'Banyo eski çağlardan beri özellikle Türklerin günlük yaşamında çok önemli yere sahiptir. Yerleşik yaşama geçen Türkler, yaşam alanlarını en modern ve kullanışlı şekilde dizayn ettiler. Osmanlı Dönemi’nden kalma saraylar, konaklar ve hanlar günümüze kadar yaşayacak şekilde dayanıklı malzemelerle donatılmıştır. Bu yaşam alanlarının ortak noktalarından biri ise hamamlar olmuştur. Malzeme olarak en dayanıklı doğal taşlardan olan **mermer**, hamamın kalbi olarak farklı şekilde kullanılmıştır.',
        'Zamanla gelenekleşen **hamam** kültürü aynı zamanda gelinlerin önceden görüldüğü, evlenmeden önce eğlencelerin yapıldığı, rahatlamak için masajların yapıldığı yer olmuştur. Fakat kimyasal ilaçların bile olmadığı dönemden önce kullanılan hamamlarda en önemli unsurlardan biri olan hijyen, her zaman üst seviyede olmuştur. Mermerin kolay temizlenebilen, mikroplarla kolay başa çıkılabilen özelliği ile **hamam** ve banyolarda birinci sırada kullanılan malzeme olmayı başarmıştır.',
        'Günümüzde yaşam alanlarının apartmana çevrilmesiyle **banyo** alanları küçülmüştür. Bu küçük odayı yine de en hijyenik şekliyle korumak için kullanılan kural devam etmektedir. Bekamar **Mermer**’in birbirinden zengin renk seçenekleri ev tasarımınızla uyumlu şekilde yükselmektedir. **Calacatta mermer** yüzeylerin açık tonu, banyonuzda ferahlık sağlarken, her renk **banyo** dolabınızla da kolayca harmanlanır. Ayrıca üzerindeki gri desenli çizgileri dinamiklik sağlarken şıklığın parlayan çizgisini de yakalar.',
        'Küveti olan banyolar için Bekamar **Traverten** yüzeyler oldukça idealdir. Kaymayan, suya dayanıklı yüzeyler küvetinizin modern duruşunu en zarifliği ile sergiler. Uzun ömürlü yapısıyla yıllarca kullanım ömrü sağlayan **Traverten** küvetinizde dinginliği her kullanımda yaşayacaksınız.',
        'Modern yaşamın getirdiği sadelik ile banyonuzda fazla eşyadan kurtularak sadece ihtiyaç kadarını **banyo** dolabınızda saklayabilirsiniz. Sevdiğiniz bir ressamın resmini astığınız banyonuzun duvarlarını da **Bekamar Grizio Mermer** ile tamamlayabilirsiniz. Kendi bir ressamın fırça darbelerini yaşatır misali renk tonlamaları ve desenli olan yüzeylerde, doğanın sunduğu özgürlüğü sonuna kadar hissedeceksiniz.'
      ]
    },
    {
      id: 'bekamar-onyx', title: 'Renk Tonu İle Büyüleyen; Bekamar Onyx!',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ · MİMARİ VE TASARIM',
      image: 'bal-onyx_536_485.jpg', alt: 'Bal Onyx taşının sıcak ve yarı saydam renk tonları',
      excerpt: 'Doğadan ilham alan renk ve dokular yaşam alanlarına daha doğal, konforlu bir his verir. Onyx’in kendine özgü tonları dekorasyonda farklı bir etki yaratır.',
      paragraphs: ['Evimizin tasarımını, doğadan ilham alarak harmanladığımızda daha natürel ve konforlu olur. Dekorasyonda kullandığımız tüm aksesuarların aslında yaşamımız üzerinde olumlu ya da olumsuz enerjisi vardır. Bu ispatlanmış bir durum değilse de tarih boyunca bu etkiler araştırılmış ve böyle olduğuna dair ispatlar aranmaya devam edilmiştir. Birçok kişinin karşılaştığı sonuçlar doğal taşların olumsuz enerjiyi emerek mutluluk verdiği yöndedir.']
    },
    {
      id: 'stone-artworks', title: 'Doğal Taşlardan Oluşan Harika Eserler',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ · MİMARİ VE TASARIM',
      image: 'belvedere_502_290.jpg', alt: 'Doğal taş yüzeyinde belirgin damarların oluşturduğu desen',
      excerpt: 'Doğal taşlar, dayanıklı yapılarıyla şehirlerin ve yapıların yüzyıllar boyunca ayakta kalmasına katkı sağladı; taş işçiliği yaşamı ve mimariyi dönüştürdü.',
      paragraphs: ['Doğal taşlar medeniyetlerin kurulmasında en çok etkili doğanın hazinelerindendir. İnsanoğlu taşları işlemeye başladığı andan itibaren yaşamı kolaylaşmış, daha kolay bir arada yaşamış ve günlük yaşamını kolaylaştırmıştır. Doğal taşların dayanıklı özelliği sayesinde yüzyıllar öncesine kadar kurulu olan şehirleri ve binaları günümüzde inceleyebiliyoruz.']
    },
    {
      id: 'travertine-features', title: 'Traverten Taşının Özellikleri Nelerdir?',
      category: ['guide'], categoryLabel: 'DOĞAL TAŞ REHBERİ',
      image: 'sirketimizimage-clean.png', alt: 'Açık tonlu doğal taş dokusu',
      excerpt: 'Kalsiyum karbonatın çökelmesiyle oluşan traverten, lifli dokusu ve dayanıklı yapısıyla öne çıkar. Türkiye, traverten üretiminde dünyanın önde gelen ülkelerindendir.',
      paragraphs: ['Yer altı sularının içlerindeki kalsiyum karbonatın çökmesiyle oluşan Traverten; lifli bir görünüme sahiptir. Doğal taşların en dayanıklılarından biri olan Traverten kalker biçimindedir. Türkiye, dünyada en çok Traverten üretimini yapan ülkelerdendir. Bekamar Ege Bölge Distribütörü olarak, en iyi doğal taşı olan Traverten taşının özelliklerini sizler için derledik.']
    },
    {
      id: 'office-marble', title: 'Ofis Tasarımızda Trend Mermer Renkleri',
      category: ['design', 'applications'], categoryLabel: 'MİMARİ VE TASARIM · UYGULAMA ÖRNEKLERİ',
      image: 'içmekan.png', alt: 'Doğal taş dokularıyla tasarlanmış çağdaş iç mekân',
      excerpt: 'Ofis tasarımında modern ve güncel bir çizgi yakalamak zor olabilir. Doğal taşların sade, şık duruşu bu mekânlara güçlü bir karakter kazandırır.',
      paragraphs: ['Günümüzün yarısını geçirdiğimiz, önemli kararlar aldığımız, motivemizi artıran en önemli unsurlar ofis tasarımında gizlidir. Modern bir ofis çizgisini yakalarken sürekli değişen ve yenilikleri takip eden dekorasyonu bulmak oldukça zordur. İstenilen görünümü doğal taşların sade ve şık duruşuyla çok kolay yakalayabilirsiniz.']
    },
    {
      id: 'speckled-granite', title: 'Benekli Yüzeylerin Şık Duruşu: Granit!',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ',
      image: 'star-galaxy_502_290.jpg', alt: 'Kristal taneleriyle benekli koyu granit yüzey',
      excerpt: 'Granit, iri taneli kristal yapısı ve farklı renk seçenekleriyle tanınır. Sertliği ve dayanıklılığı sayesinde uzun ömürlü yüzeyler sunar.',
      paragraphs: ['Yapı itibariyle sert ve kristal yapılı minarellerden meydana gelen Granit; açık renkli ve iri taneli magmatik kayaçlar şeklindedir. Beyaz, gri veya pembe renkte olan doğal taş duruma göre turuncu renklerde de görülebiliyor. Diğer doğal taşlara göre daha büyük kristal oluşturma potansiyeline sahip olan Granit yıllara en dayanıklı yüzeyler olarak varlığını koruyor.']
    },
    {
      id: 'interior-stone', title: 'İç Mekan Kaplamada Doğal Taş Zarifliği!',
      category: ['applications', 'design'], categoryLabel: 'UYGULAMA ÖRNEKLERİ · MİMARİ VE TASARIM',
      image: 'avakadouygulama.png', alt: 'Doğal taş yüzey kullanılan modern iç mekân uygulaması',
      excerpt: 'Ev dekorasyonu; yüzeylerden mobilyalara, aksesuarlardan renklere kadar yaşam alanlarının karakterini ve hissini şekillendirir.',
      paragraphs: ['İç mekan tasarımı evimizde geçirdiğimiz kaliteli zamanında vazgeçilmez bir parçasını oluşturur. Zevkimizin yansıması olan ev dekorasyonumuz kullandığımız aksesuarlardan, yüzeylere, mobilyalardan, renklere kadar farklılık göstererek ruh halimizi etkileyebilir.']
    },
    {
      id: 'alacati-marble', title: 'Dekorunuzda Alaçatılı Rüzgarı Estiren Mermerler!',
      category: ['design', 'applications'], categoryLabel: 'MİMARİ VE TASARIM',
      image: 'avakadourun.png', alt: 'Yeşil doğal taşın belirgin damar yapısı',
      excerpt: 'Doğayla iç içe yazlık yaşamdan ilham alan Alaçatı tarzı, doğal ve rustik yüzeylerle şehirdeki evlere de taşınabilir.',
      paragraphs: ['Yaz mevsiminin güzelliğini yaşadığımız bölgeler genellikle doğa ile iç içe olan yazlıklarımızdır. Bekamar mermerleri ile şehirdeki apartman dairenizi yazlık havası verebilir, yazlığınızı ise doğal ve rüstik tasarlayabilirsiniz. Son zamanlarda trend olan Alaçatı tarzı, birçok farklı yaşama dokunuyor.']
    },
    {
      id: 'ege-bekamar', title: 'Ege Bölgesi’nde Doğal Mermerin Adresi; Bekamar!',
      category: ['industry'], categoryLabel: 'SEKTÖR HABERLERİ',
      image: 'şubemerkez2.png', alt: 'Bekamar merkezindeki doğal taş stok ve çalışma alanı',
      excerpt: 'Doğal taş; dayanıklılığın, sabrın ve dengenin simgesi. Bekamar mermer yüzeyleri uzun yıllar biçimini koruyarak mekânlara eşlik eder.',
      paragraphs: ['Doğal taş; insan hayatının vazgeçilmez, yaşamını kolaylaştıran, asırlardır iç içe olduğu manevi inancımızın simgesidir. Sonsuzluk, enerji, sabır ve dengeyi simgeleyen Bekamar mermer, dayanıklı yapısıyla uzun yıllar verilen şekli koruyarak tarihe tanıklık eder.']
    },
    {
      id: 'calisco-quartz', title: 'Evinizdeki Dayanıklı Güzellik: Calisco Kuvars!',
      category: ['guide', 'applications'], categoryLabel: 'DOĞAL TAŞ REHBERİ · YÜZEYLER',
      image: 'kuvarsurunler.png', alt: 'Kuvars yüzeylerin açık renkli ve doğal desenli dokusu',
      excerpt: 'Ahşap ve mermer gibi farklı malzemeler, yaşam alanlarının atmosferini ve kullanım hissini değiştirir. Kuvars yüzeyler bu tasarım bütünlüğünün bir parçasıdır.',
      paragraphs: ['Yaşam alanlarını tasarlarken doğada bulunan birçok farklı malzemeye ihtiyaç duyarız. Ahşap kullanımı ortamda bohem havası estirirken, mermer kullanımı bulunduğunuz ortamı hem ferahlatır hem de uzun süre temiz kalmasını sağlar.']
    },
    {
      id: 'neolith-porcelain', title: 'Bekamar’ın Yükselen Trendi; Neolith Porselen Yüzeyler!',
      category: ['guide', 'applications'], categoryLabel: 'YÜZEYLER · DOĞAL TAŞ REHBERİ',
      image: 'porselenurunler.png', alt: 'Doğal damar desenli porselen yüzey',
      excerpt: 'Hijyenik, pürüzsüz ve kaliteli özellikleriyle öne çıkan Neolith, doğal minerallerden üretilen sinterlenmiş bir porselen yüzeydir.',
      paragraphs: ['Son yıllarda yaşam alanlarında hijyenik, pürüzsüz, kaliteli özellikleriyle trend olan Neolith, oldukça şık porselen levhadır. Sinterlenmiş yüzey olan Neolith Porselen Yüzeyler, yüzde yüz doğal minerallerden yapılmıştır.']
    },
    {
      id: 'belenco-quartz', title: 'Yaşam Alanlarınızda Modern Dokunuş; Belenco Kuvars!',
      category: ['guide', 'design'], categoryLabel: 'YÜZEYLER · MİMARİ VE TASARIM',
      image: 'carrarawhiteuygulama.png', alt: 'Açık damarlı kuvars yüzeyin yaşam alanındaki uygulaması',
      excerpt: 'Renk ve yüzey seçimleri, evde ve iş yerinde geçirdiğimiz zamanın hissini etkiler. Belenco kuvars yüzeyler uzun süreli kullanım için bir seçenek sunar.',
      paragraphs: ['Evimiz ya da zamanımızın büyük çoğunluğunu geçirdiğimiz işimiz zevkimize göre tasarladığımız renk ve aksesuarlarla çevrilidir. Bu da gün içerisinde ruhsal halimiz üzerinde rol oynayabilir. Sevdiğimiz renkleri ve yüzeyleri uzun süreli kullanmak için Belenco Kuvars yüzeyler tam size göre…']
    },
    {
      id: 'granite-radon', title: 'Granitler Hakkında Radon /Radyasyon Gerçeği',
      category: ['guide'], categoryLabel: 'DOĞAL TAŞ REHBERİ',
      image: 'star-galaxy_502_290.jpg', alt: 'Koyu renk kristal dokulu granit yüzey',
      excerpt: 'Granit, dayanıklı ve hijyenik yapısıyla farklı yaşam alanlarında kullanılır. Bu yazı, granit ve radyasyon hakkındaki merak edilenlere giriş yapıyor.',
      paragraphs: ['Kullanım ömrü olarak en kaliteli özelliklerinden birini sunan Granit, yaşam alanlarının her yerinde sağlıklı, hijyenik ve ergonomik olanaklarla şık duruşunu sergiliyor. Peki Granitte Radon ve Radyasyon Gerçeği ile ilgili ne kadar bilgiye sahipsiniz?']
    },
    {
      id: 'stone-care', title: 'Doğal Taşların Bakımı Nasıl Olmalı?',
      category: ['guide'], categoryLabel: 'DOĞAL TAŞ REHBERİ',
      image: 'dogaltaslar.png', alt: 'Açık renk doğal taş yüzeyinde altın ve gri damarlar',
      excerpt: 'Milyonlarca yılda şekillenen doğal taşlar, çevreleriyle etkileşim içinde kendilerine özgü bir doku ve karakter taşır.',
      paragraphs: ['Milyonlarca yıllık bir süreç sonucunda meydana gelen doğal taşlar, enerjileriyle canlıların üzerinde oldukça etkilidir. Bulundukları ortamdaki enerjiden etkilenen taşlar biriktirdikleri enerjiyi de etraflarına yayarlar.']
    },
    {
      id: 'marble-civilization', title: 'Medeniyetlerin Kuruluşunun Yapı Taşı: Mermer!',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ · MİMARİ VE TASARIM',
      image: 'carrarawhite.png', alt: 'Beyaz mermer yüzeyde doğal gri damarlar',
      excerpt: 'Mermer, yeniden kristalleşme süreciyle oluşan; farklı renklere bürünebilen, kesilip cilalanabilen değerli bir doğal taştır.',
      paragraphs: ['Dünyanın en değerli doğal taşlarından olan Mermer, metomorfizma olayı sonucunda doğanın bizlere kazandırdığı en kıymetli oluşumlardandır. Kalkerlerin yeniden kristalleşmesi sonucu meydana gelen mermer, renkleri genelde beyaz ve griye dönüktür. Sarı, pembe, kırmızı, mavimsi, siyah gibi farklı renklere de dönüşebilen mermer, kesilebilir ve cilalanabilir özelliktedir.']
    },
    {
      id: 'honed-polished', title: 'Honlu Mermer ile Cilalı Mermer Arasındaki Farklar Neler?',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ · MİMARİ VE TASARIM',
      image: 'pandawhite_uygulama.png', alt: 'Mermer yüzeyin iç mekândaki uygulama görünümü',
      excerpt: 'Mermer yüzeyler farklı biçimlerde işlenerek renk ve ışığı yansıtma özellikleri değiştirilir. Honlu ve cilalı bitişlerin etkileri de birbirinden ayrılır.',
      paragraphs: ['Yüzyıllardır insanoğlunun hayatında önemli bir yer tutan mermer, günümüzde de yaşam alanlarımızda sağlam ve şık yapısıyla kullanılmaya devam edilmektedir. Metaformik yapılı mermer, teknolojinin ve modanın değişmesiyle çıkarılan yüzeyleri de işlenmiş ve yüzeylerde farklı renk ve ışığı yansıtma parlaklıkları değiştirilmiştir.']
    },
    {
      id: 'dark-granite', title: 'Karanlığın Zarif Dokusu; Granit!',
      category: ['guide', 'design'], categoryLabel: 'DOĞAL TAŞ REHBERİ · MİMARİ VE TASARIM',
      image: 'star-galaxy_502_290.jpg', alt: 'Koyu ve benekli granit yüzey',
      excerpt: 'Siyahın zamansız görünümü granit yüzeylerde güçlü bir ifade kazanır; geleneksel ya da çağdaş tasarımlarla uyum sağlar.',
      paragraphs: ['Evimizi tasarlarken trend renkleri de göz ardı etmek istemeyiz. Trend renklerin her dönem duruşunu koruduğu koyu renkler, granit yüzeylerde de oldukça beğeniliyor. Zamansızlığı ile ismini tarihe yazdıran siyah, bulunduğu her ortamda tasarlandığı zevke göre geleneksel görünümünü ya da çağdaşlığını korur.']
    }
  ];

  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const imagePath = (article) => `../assets/images/${article.image}`;
  const cardDescription = (article) => `${article.title} ${article.excerpt} ${article.categoryLabel}`;

  function makeImageButton(article, featuredImage = false) {
    const button = makeElement('button', featuredImage ? 'blog-feature__image' : 'blog-card__image');
    button.type = 'button';
    button.dataset.blogOpen = article.id;
    button.setAttribute('aria-controls', 'blogReader');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `${article.title} yazısını aç`);
    const image = document.createElement('img');
    image.src = imagePath(article);
    image.alt = article.alt;
    image.loading = featuredImage ? 'eager' : 'lazy';
    image.decoding = 'async';
    button.append(image);
    if (featuredImage) button.append(makeElement('span', 'blog-image-note', 'YAZIYI KEŞFEDİN'));
    return button;
  }

  function makeReadButton(article) {
    const button = makeElement('button', 'blog-read', 'YAZIYI OKU ');
    button.type = 'button';
    button.dataset.blogOpen = article.id;
    button.setAttribute('aria-controls', 'blogReader');
    button.setAttribute('aria-expanded', 'false');
    button.append(makeElement('span', '', '↓'));
    button.lastElementChild.setAttribute('aria-hidden', 'true');
    return button;
  }

  function categoryText(label) {
    const category = makeElement('p', 'blog-card__category');
    category.textContent = label;
    return category;
  }

  function renderFeatured(article) {
    featured.className = 'blog-feature';
    featured.dataset.blogCard = '';
    featured.dataset.category = article.category.join(' ');
    featured.dataset.search = cardDescription(article);
    const copy = makeElement('div', 'blog-feature__copy');
    copy.append(categoryText(article.categoryLabel));
    copy.append(makeElement('h2', 'serif', article.title));
    copy.append(makeElement('p', 'blog-card__excerpt', article.excerpt));
    copy.append(makeReadButton(article));
    featured.replaceChildren(makeImageButton(article, true), copy);
  }

  function renderCard(article) {
    const card = makeElement('article', 'blog-card');
    card.dataset.blogCard = '';
    card.dataset.category = article.category.join(' ');
    card.dataset.search = cardDescription(article);
    const copy = makeElement('div', 'blog-card__copy');
    copy.append(categoryText(article.categoryLabel));
    copy.append(makeElement('h3', 'serif', article.title));
    copy.append(makeElement('p', 'blog-card__excerpt', article.excerpt));
    copy.append(makeReadButton(article));
    card.append(makeImageButton(article), copy);
    return card;
  }

  renderFeatured(articles[0]);
  grid.replaceChildren(...articles.slice(1).map(renderCard));

  const cards = [...document.querySelectorAll('[data-blog-card]')];
  let activeCategory = 'all';
  let activeOpener = null;
  const normalize = (value) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function closeReader(restoreFocus = true) {
    reader.hidden = true;
    document.querySelectorAll('[data-blog-open][aria-expanded="true"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (restoreFocus && activeOpener) activeOpener.focus();
    activeOpener = null;
  }

  function openReader(button) {
    const article = articles.find((item) => item.id === button.dataset.blogOpen);
    if (!article) return;
    activeOpener = button;
    readerTitle.textContent = article.title;
    readerCategory.textContent = article.categoryLabel;
    readerImage.src = imagePath(article);
    readerImage.alt = article.alt;
    readerBody.replaceChildren(...article.paragraphs.map((text) => {
      const paragraph = document.createElement('p');
      text.split(/(\*\*.*?\*\*)/g).forEach((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const strong = document.createElement('strong');
          strong.textContent = part.slice(2, -2);
          paragraph.append(strong);
        } else paragraph.append(document.createTextNode(part));
      });
      return paragraph;
    }));
    reader.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    reader.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    reader.focus({ preventScroll: true });
  }

  function updateResults() {
    const query = normalize(search.value.trim());
    let visibleCount = 0;
    cards.forEach((card) => {
      const categories = card.dataset.category.split(/\s+/);
      const searchable = normalize(`${card.dataset.search || ''} ${card.innerText}`);
      const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
      const matchesQuery = !query || searchable.includes(query);
      const visible = matchesCategory && matchesQuery;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    empty.hidden = visibleCount > 0;
    count.textContent = String(visibleCount).padStart(2, '0');
    if (activeOpener?.closest('[data-blog-card]')?.hidden) closeReader(false);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.blogFilter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      updateResults();
    });
  });
  search.addEventListener('input', updateResults);
  document.querySelectorAll('[data-blog-open]').forEach((button) => button.addEventListener('click', () => openReader(button)));
  closeButton?.addEventListener('click', () => closeReader());
  updateResults();
})();
