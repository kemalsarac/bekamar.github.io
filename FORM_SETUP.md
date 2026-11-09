# Bekamar form API kurulumu

Bu dokuman, statik Bekamar sitesini Cloudflare Worker, Turnstile ve Resend ile baglamak icin gereken adimlari aciklar. Worker ve frontend su anda bilerek e-posta gondermez. `EMAIL_ENABLED` false, frontend API URL'si ve Turnstile site key bos birakilmistir. DNS, Worker route'u, API sirri veya canli gonderim yapilandirilmadi.

## Mimari ve mevcut durum

- Tarayici formu yalnizca JSON POST istegi gonderir: `/api/contact`.
- Worker Turnstile tokenini sunucu tarafinda dogrular, alanlari kontrol eder ve Resend'e yalnizca plain-text mesaj gonderir.
- Alim adresi kodda sabittir: `info@bekamar.com`. Istemciden `to`, `from` veya baska beklenmeyen alan kabul edilmez.
- Form icerigi sessionStorage/localStorage'a kaydedilmez.
- Yaniti alacak musteri e-postasi yalnizca `Reply-To` olur. Gonderici adresi, `EMAIL_FROM` ve `VERIFIED_SENDER_DOMAIN` ayni domaini gostermeden kabul edilmez.
- API, sirlar, gonderici domaini, Turnstile secret'i veya rate-limit binding eksikse gonderim yapmaz. `EMAIL_ENABLED` ancak tum kontroller tamamlandiktan sonra acilmalidir.
- Sirketimiz bolumunde etkin bir form yok; ziyaretci iletisim sayfasina yonlendirilir. Etkin form `bize-ulasin/index.html` icindedir.

## Form alanlari ve davranisi

| Alan | Zorunlu | Sinir / kontrol |
|---|---:|---|
| Ad Soyad (`name`) | Evet | 2–100 karakter |
| E-posta (`email`) | Evet | Gecerli bicim, en fazla 254 karakter |
| Telefon (`phone`) | Hayir | En fazla 40 karakter |
| Konu (`topic`) | Evet | Arayuzde sunulan sabit seceneklerden biri |
| Mesaj (`message`) | Evet | 2–5.000 karakter |
| Turnstile token (`turnstileToken`) | Evet | En fazla 2.048 karakter, tek kullanimli dogrulama |

Form arayuzu `js/contact.js` tarafindan yonetilir; genel ayarlar public `js/contact-config.js` dosyasindadir. API URL'si/site key bosken submit dugmesi devre disidir ve formun gecici kullanilamadigi acikca gosterilir. Gercek HTTP 200 `{ "ok": true }` yaniti gelmeden basari mesaji gosterilmez.

## Resend hesabi ve domain

1. Bekamar'a ait bir Resend hesabi olusturun veya mevcut hesabi kullanin.
2. Resend Domains ekraninda gonderim domaini ekleyin. Tercih `send.bekamar.com` olabilir; domain/DNS incelemesi ve hesap sahibi onayi olmadan secim kesinlesmis sayilmaz.
3. Resend panelinin o domain icin olusturdugu DNS kayitlarini deger ve host adlariyla birlikte alin. DKIM/SPF ve panelin istedigi diger gonderim kayitlarini sadece Resend'in gosterdigi tam degerlerle ekleyin.
4. DNS degisikligini yetkili DNS yoneticisi yapmalidir. Mevcut MX kayitlarina dokunmayin. Kok domainde mevcut SPF TXT varsa ikinci SPF kaydi acmayin; mevcut kayit yonetimiyle birlestirme gerekip gerekmedigini DNS yoneticisi belirlesin. DMARC politikasi varsa degistirmeden once sahibiyle inceleyin.
5. Resend domain ekraninda dogrulama tamamlanana kadar gonderici adresini etkinlestirmeyin.

Bu depoda hicbir DNS kaydi degistirilmedi. Resend'in her domain icin verdigi kayitlar hesaba ozeldir; burada ornek DNS hedefi veya degeri uydurulmamamistir.

## Turnstile kurulumu

1. Cloudflare dashboard'da yeni Turnstile widget'i olusturun.
2. Yalnizca yayin alan adlarina izin verin (ornek: `bekamar.com`, `www.bekamar.com`). `localhost`/`127.0.0.1` adreslerini production widget'a eklemeyin.
3. Public **site key** degerini `bekamar-vscode/js/contact-config.js` icindeki `turnstileSiteKey` alanina yazin. Bu deger tarayicida gorunur; gizli degildir.
4. Secret key'i yalnizca Worker secret olarak ekleyin; HTML/JS'ye veya repo'ya yazmayin.
5. Worker, Siteverify API cevabinda basari, `contact` action ve izinli hostname arar. Yanlis token e-postaya ilerlemez.

Yerel otomasyon icin Cloudflare'in resmi Turnstile test key/secret ciftleri kullanilabilir. `wrangler.jsonc` gelistirme ortami `TURNSTILE_TEST_MODE=true` ile test tokeninin `example.com` hostname cevabini kabul eder. Bu yalniz test secret'iyle kullanilmalidir; production'da test modu veya test anahtari kullanmayin. Worker'in gelistirme ortami yine de e-posta gonderimini kapali tutar.

## Worker kurulumu

Gereken araclar: Node.js ve Wrangler 4.36.0 veya sonrasi (Rate Limiting API binding'i icin).

```sh
cd bekamar-vscode/functions/contact-worker
npm install
npm test
npm run dev
```

`npm run dev` `dev` Wrangler ortamini kullanir ve `EMAIL_ENABLED=false` tutar. Yerel formu Worker'a baglamak icin siteyi HTTP ile sunun; `js/contact-config.js` icinde `apiUrl` degerini yerel Worker endpoint'ine, `turnstileSiteKey` degerini yalnizca test site key'ine ayarlayin. Worker secret'i de resmi test secret'i olmalidir. Test tokeni ile Turnstile sunucu dogrulamasi yapilabilir; gecerli formdan sonra API 503 dondurur ve e-posta gondermez.

`wrangler.jsonc` icindeki production/dev rate limit namespace ID'leri hesaba ozgu Cloudflare kaynaklari degildir. Deployment oncesi her birini hesap icinde benzersiz bir pozitif tamsayi ile degistirin. Binding 5 istegi / 60 saniye / IP anahtariyla sinirlar. Cloudflare bu Worker binding'ini bolgesel ve yaklasik uygular; katı, dunya capinda kota degildir.

## Secret ve degisken yapilandirmasi

Worker dizininden secret'lari interaktif olarak ekleyin:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Gelistirme ortami secret'lari ayri tutulacaksa komuta `--env dev` ekleyin. Degerleri terminal komut satirina koymayin; soruldugunda interaktif girin. Secret'lar yalnizca Cloudflare Worker secret binding'lerinde tutulur.

`EMAIL_FROM` ve `VERIFIED_SENDER_DOMAIN` gizli degildir ama yalnizca dogrulamasi tamamlanmis domain/alici adresi kesinlestikten sonra Worker environment variable olarak eklenmelidir. `ALLOWED_ORIGINS` sadece gercek site origin'i ve gereken yerel gelistirme origin'lerini icermelidir; son slash olmadan tam origin eslesmesi yapilir. `TURNSTILE_HOSTNAMES` tam hostname listesi olmalidir.

Resend API anahtari icin gonderim yetkisi ve mumkunse ilgili domainle sinirlandirilmis anahtar secin. Anahtari `js/contact-config.js`, HTML, Git veya issue/rapora koymayin.

## API route ve frontend yapilandirmasi

Worker kodu `POST /api/contact` yolunu sunar. Gercek API host'u henuz belirlenmedi. `send.bekamar.com` onerisi e-posta gonderim domain'idir; API host'u oldugu varsayilmamalidir.

1. Cloudflare'da Worker'i once test ortaminda olusturun.
2. API icin onaylanmis hostname/route belirleyin. Mevcut statik sitenin rotalariyla cakismayi DNS/Cloudflare yoneticisi kontrol etsin.
3. `js/contact-config.js` icine tam HTTPS endpoint'i yazin; ornek bicim `https://<onayli-api-host>/api/contact`. Yer tutucuyu canliya koymayin.
4. Worker `ALLOWED_ORIGINS` ve `TURNSTILE_HOSTNAMES` degerlerini sayfanin gercek origin/hostname degerleriyle eslestirin.
5. Once API ile e-posta kapaliyken `503 temporarily_unavailable`, CORS, Turnstile, rate-limit ve validation davranisini dogrulayin.

## E-posta test ortami

- Repodaki `npm test` Resend/Turnstile isteklerini mock eder; disariya e-posta gondermez.
- Gercek staging e-posta testi icin domain dogrulanmis, secret'lar eklenmis ve test ortaminda gonderim acik olmalidir. Alim adresi kodda sabit oldugundan staging e-postalari da `info@bekamar.com` adresine gider; bu adres sahibinden onay alin.
- Resend test mode/sandbox ozelliklerini hesap arayuzunden kontrol edin. Alim adresi override edilemez. Provider simule edilen test gonderimini desteklemiyorsa, canli iletimden once yalnizca onayli Bekamar alicisina gidecek kontrollu tek test gonderimi yapin.
- Test ortaminda olumsuz senaryolar (Turnstile fail, rate limit, Resend 500) mevcut birim testlerinde upstream mock'lariyla kapsanir.

## Testler

```sh
npm test
```

`functions/contact-worker/test/index.test.js` su durumlari kapsar:

1. Gecerli form: sabit alici ve musteri Reply-To kontrolu.
2. Eksik alan.
3. Hatali e-posta.
4. 16 KiB ustu girdi.
5. POST disi metod.
6. Gecersiz Turnstile tokeni.
7. Rate limit.
8. Resend servis hatasi.
9. E-posta etkin degilken 503 ve Resend'e istek cikmamasi.
10. Istemcinin alici alanini degistirememesi ve mesaj iceriginin plain text kalmasi.

Bunlar Worker handler'ina dogrudan yonelik birim testleridir; gercek Cloudflare, Turnstile, Resend hesabi, DNS, browser CORS veya gelen kutusu teslimatini test etmez.

## Canliya alma kapilari

Canli gonderim acilmadan once asagidaki sirayla tamamlayin:

1. DNS sahibi ve onayli gonderim domain'i belirlenir; mevcut MX korunur.
2. Resend domain dogrulamasi ve gonderici adresi tamamlanir.
3. Cloudflare Turnstile widget'i production hostname'leriyle olusturulur.
4. Worker production secret'lari eklenir ve benzersiz rate-limit namespace ID atanir.
5. API hostname/route, frontend HTTPS URL'si, CORS origin'i ve Turnstile hostname'i birbirini tutar.
6. E-posta kapaliyken production-like kontrol yapilir; sonra Bekamar onayi ile aliciya kontrollu test gonderimi yapilir.
7. `EMAIL_ENABLED` yalnizca production Worker'da `true` yapilir; deploy onayi ayri alinir.

Bu gorevde DNS degistirilmedi, Worker deploy edilmedi ve gercek e-posta gonderilmedi.

## Ilgili resmi dokumanlar

- [Cloudflare Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [Cloudflare Wrangler JSON configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Resend Send Email API](https://resend.com/docs/api-reference/emails/send-email)
