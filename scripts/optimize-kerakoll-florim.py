"""Fetch Florim's official Kerakoll × Florim photography and create local WebP variants."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import json
import urllib.request

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized" / "florim" / "special-series"
IMAGES = {
    "series-oblio-main": "1789565741/2316",
    "series-oblio-detail-2": "1789565741/2318",
    "series-oblio-detail-3": "1789636282/2325",
    "series-superfici-main": "1759490446/1739",
    "series-superfici-detail-2": "1759490448/1751",
    "series-superfici-detail-3": "1759490448/1753",
    "series-elitique-main": "1747125507/1586",
    "series-elitique-detail-2": "1747126215/1592",
    "series-elitique-detail-3": "1747125640/1590",
    "kerakoll-hero": "1789480377/2293",
    "kerakoll-project": "1789544847/2296",
    "kerakoll-colour-story": "1789480935/2295",
    "sensicolore-feature": "1789546237/2311",
    "kerakoll-kk-1422": "1789544847/2296",
    "kerakoll-kk-1424": "1789544848/2299",
    "kerakoll-kk-1339": "1789544847/2297",
    "kerakoll-kk-4092": "1789544849/2305",
    "kerakoll-kk-6216": "1789544849/2309",
    "kerakoll-kk-8368": "1789544849/2310",
    "kerakoll-kk-5249": "1789544849/2306",
    "kerakoll-kk-5190": "1789544849/2307",
    "kerakoll-kk-6161": "1789544849/2308",
    "kerakoll-kk-3424": "1789544848/2304",
    "kerakoll-kk-3458": "1789544848/2303",
    "kerakoll-kk-3069": "1789544848/2302",
    "kerakoll-kk-1123": "1789544847/2298",
    "kerakoll-kk-2307": "1789544848/2300",
    "kerakoll-kk-2490": "1789544848/2301",
}


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = {}
    for name, image_id in IMAGES.items():
        url = f"https://www.florim.com/d/filer/canonical/{image_id}/"
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/*,*/*"})
        with urllib.request.urlopen(request, timeout=40) as response:
            source = response.read()
        with Image.open(BytesIO(source)) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            width, height = image.size
            variants = []
            for edge in (800, 1600):
                variant = image.copy()
                variant.thumbnail((edge, edge), Image.Resampling.LANCZOS)
                target = OUTPUT / f"{name}-{variant.width}.webp"
                variant.save(target, "WEBP", quality=84, method=6)
                variants.append({"path": target.relative_to(ROOT).as_posix(), "width": variant.width,
                                 "height": variant.height, "bytes": target.stat().st_size})
        records[name] = {"sourceUrl": url, "sourceBytes": len(source), "sourceWidth": width,
                         "sourceHeight": height, "webp": variants}
    (OUTPUT / "kerakoll-manifest.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Fetched and optimized {len(records)} Florim source images into {OUTPUT}")


if __name__ == "__main__":
    main()
