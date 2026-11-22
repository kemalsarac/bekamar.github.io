"""Fetch selected official Kale/Kalebodur product images and build local WebP variants."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import json
import re
import urllib.request

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized" / "kale" / "products"
PRODUCTS = [
    {"slug": "aterna-smoke", "brand": "Kalebodur", "code": "310100700789", "name": "Aterna Smoke Mat Porselen Karo", "collection": "Aterna", "description": "60 × 120 cm mat porselen karo. Kale ürün kaydında kaymazlık sınıfı R-10 olarak listelenir.", "specifications": {"dimensions": "60 × 120 cm", "surface": "Mat", "slipResistance": "R-10", "color": "Gri"}, "url": "https://www.kale.com.tr/urunler/aterna-smoke-mat-porselen-karo-310100700789"},
    {"slug": "pietra-di-gre-cream", "brand": "Kalebodur", "code": "310100700792", "name": "Pietra Di Gre Cream Mat Porselen Karo", "collection": "Pietra Di Gre", "description": "60 × 120 cm mat porselen karo. Resmî ürün sayfası rengi Bej, kaymazlık sınıfını R-10 olarak belirtir.", "specifications": {"dimensions": "60 × 120 cm", "surface": "Mat", "slipResistance": "R-10", "color": "Bej"}, "url": "https://www.kale.com.tr/urunler/pietra-di-gre-cream-mat-porselen-karo-310100700792"},
    {"slug": "berry-brown-marble", "brand": "Kalebodur", "code": "310100800792", "name": "Berry Brown Marble Parlak Porselen Karo", "collection": "Berry Brown Marble", "description": "60 × 120 cm, 8 mm kalınlığında, parlak porselen karo. Üretici ürün kaydındaki renk Kahve olarak geçer.", "specifications": {"dimensions": "60 × 120 cm", "thickness": "8 mm", "surface": "Parlak", "color": "Kahve"}, "url": "https://www.kale.com.tr/urunler/berry-brown-marble-parlak-porselen-karo-310100800792"},
    {"slug": "zero-2-0-ada-oval-lavabo", "brand": "Kale", "code": "310200200826", "name": "Zero 2.0 Ada Oval Çanak Lavabo Mat Latte 60 × 40 cm", "collection": "Zero 2.0", "description": "60 × 40 cm oval çanak lavabo. Kale ürün kaydında yüzey Mat, renk Mat Latte olarak belirtilir.", "specifications": {"dimensions": "60 × 40 cm", "surface": "Mat", "color": "Mat Latte", "shape": "Oval"}, "url": "https://www.kale.com.tr/urunler/zero-2-0-ada-oval-canak-lavabo-mat-latte-60x40cm-310200200826", "documents": [{"label": "Teknik çizim · 310200200688", "url": "https://cdn-pim-ks.lidiacommerce.com/file/10/9/310200200688/8873FA1A-3A85-4607-B1D9-3075FE6F0104", "file": "assets/catalog/kale/zero-2-0-lavabo-teknik-cizim-688.pdf"}]},
    {"slug": "fold-pro-set", "brand": "Kale", "code": "610100201600", "name": "Fold Pro Set Mat Vizon 100 cm", "collection": "Fold Pro", "description": "Lavabo dolabı, etajerli lavabo ve aydınlatmalı ayna panosundan oluşan banyo seti.", "specifications": {"dimensions": "100 cm", "productGroup": "Lavabo dolabı + etajerli lavabo + aydınlatmalı ayna"}, "url": "https://www.kale.com.tr/urunler/fold-pro-set-mat-vizon-100-cm-610100201600", "documents": [{"label": "Teknik çizim · 610100201591", "url": "https://cdn-pim-ks.lidiacommerce.com/file/10/9/610100201591/5DC439C4-611F-4709-ACE8-5C8D6C443D8E", "file": "assets/catalog/kale/fold-pro-set-teknik-cizim-1591.pdf"}, {"label": "Teknik çizim · 610100201590", "url": "https://cdn-pim-ks.lidiacommerce.com/file/10/9/610100201590/65145D30-DC9D-4FC1-956D-612B488F1216", "file": "assets/catalog/kale/fold-pro-set-teknik-cizim-1590.pdf"}, {"label": "Teknik çizim · 610100201593", "url": "https://cdn-pim-ks.lidiacommerce.com/file/10/9/610100201593/576D0B31-5E9E-4202-B884-4AFE8F43FC36", "file": "assets/catalog/kale/fold-pro-set-teknik-cizim-1593.pdf"}, {"label": "Teknik çizim · 610100201592", "url": "https://cdn-pim-ks.lidiacommerce.com/file/10/9/610100201592/F2C68776-06D5-438E-B960-7F9806238F0B", "file": "assets/catalog/kale/fold-pro-set-teknik-cizim-1592.pdf"}]},
    {"slug": "tandem-lavabo-bataryasi", "brand": "Kale", "code": "410200505712", "name": "Tandem Lavabo Bataryası Gun Grey", "collection": "Tandem", "description": "Tandem serisinden lavabo bataryası. Ürün kodu ve güncel teknik uygunluk için Kale ürün kaydı esas alınır.", "specifications": {"productGroup": "Lavabo bataryası"}, "url": "https://www.kale.com.tr/urunler/tandem-lavabo-bataryasi-gun-grey-410200505712"},
]


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/avif,image/webp,image/*,*/*"})
    with urllib.request.urlopen(request, timeout=40) as response:
        return response.read()


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    client_products = []
    for product in PRODUCTS:
        page = fetch(product["url"]).decode("utf-8", "replace")
        prefix = f"https://cdn-pim-ks.lidiacommerce.com/10/9/{product['code']}"
        candidates = list(dict.fromkeys(re.findall(r"https://cdn-pim-ks\.lidiacommerce\.com/10/9/[^\s\"<>]+", page)))
        images = [url.rstrip(")',") for url in candidates if url.startswith(prefix)]
        if not images:
            raise SystemExit(f"No official product image found for {product['slug']}")
        for document in product.get("documents", []):
            payload = fetch(document["url"])
            if not payload.startswith(b"%PDF-"):
                raise SystemExit(f"Official document is not a PDF: {document['url']}")
            target = ROOT / document["file"]
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
            document["bytes"] = len(payload)
        source = fetch(images[0])
        with Image.open(BytesIO(source)) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            width, height = image.size
            variants = []
            for edge in (800, 1600):
                variant = image.copy()
                variant.thumbnail((edge, edge), Image.Resampling.LANCZOS)
                target = OUTPUT / f"{product['slug']}-{variant.width}.webp"
                variant.save(target, "WEBP", quality=84, method=6)
                variants.append({"path": target.relative_to(ROOT).as_posix(), "width": variant.width,
                                 "height": variant.height, "bytes": target.stat().st_size})
        manifest[product["slug"]] = {"sourceUrl": images[0], "productUrl": product["url"],
                                      "sourceWidth": width, "sourceHeight": height,
                                      "sourceBytes": len(source), "webp": variants}
        product["mainImage"] = {
            "thumbnail": variants[0]["path"], "thumbnailWidth": variants[0]["width"],
            "thumbnailHeight": variants[0]["height"], "detailWebp": variants[-1]["path"],
            "width": variants[-1]["width"], "height": variants[-1]["height"],
            "sizes": "(max-width: 680px) 86vw, (max-width: 1000px) 44vw, 31vw",
        }
        client_products.append(product)
    (OUTPUT.parent / "image-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUTPUT.parent / "products.json").write_text(json.dumps({"products": client_products}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Fetched and optimized {len(client_products)} official Kale/Kalebodur product images.")


if __name__ == "__main__":
    main()
