"""Build Cimstone's static surface archive and responsive image variants."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "cimstone"
OUTPUT = ROOT / "assets" / "optimized" / "cimstone"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
DESCRIPTORS = {"cimstone", "kuvars", "yuzey", "surface", "tezgah"}


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def product_name(path: Path) -> str:
    stem = re.sub(r"_\d+_\d+$", "", path.stem)
    words = [word for word in re.split(r"[-_\s]+", stem) if word.casefold() not in DESCRIPTORS]
    return " ".join(word[:1].upper() + word[1:] for word in words)


def image_record(path: Path, slug: str) -> dict[str, object]:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        width, height = image.size
        variants: dict[str, str] = {}
        variant_sizes: dict[str, tuple[int, int]] = {}
        for edge in sorted({min(400, max(width, height)), max(width, height)}):
            variant = image.copy()
            variant.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            webp_path = OUTPUT / "products" / f"{slug}-{variant.width}.webp"
            webp_path.parent.mkdir(parents=True, exist_ok=True)
            variant.save(webp_path, "WEBP", quality=84, method=6)
            variants[str(variant.width)] = webp_path.relative_to(ROOT).as_posix()
            variant_sizes[str(variant.width)] = variant.size
            if features.check("avif"):
                avif_path = OUTPUT / "products" / f"{slug}-{variant.width}.avif"
                variant.save(avif_path, "AVIF", quality=48, speed=6)
                if avif_path.stat().st_size < webp_path.stat().st_size:
                    variants[f"{variant.width}-avif"] = avif_path.relative_to(ROOT).as_posix()
                else:
                    avif_path.unlink(missing_ok=True)
    thumb_key, full_key = str(min(400, max(width, height))), str(width)
    small_width, small_height = variant_sizes[thumb_key]
    full_width, full_height = variant_sizes[full_key]
    thumb, full = variants[thumb_key], variants[full_key]
    srcset = f"{thumb} {small_width}w" + (f", {full} {full_width}w" if full != thumb else "")
    return {
        "source": path.relative_to(ROOT).as_posix(),
        "thumbnail": full, "thumbnailWidth": full_width, "thumbnailHeight": full_height,
        "smallThumbnail": thumb, "smallThumbnailWidth": small_width, "smallThumbnailHeight": small_height,
        "detailWidth": width, "detailHeight": height, "srcset": srcset,
        "sizes": "(max-width: 680px) 46vw, (max-width: 1000px) 31vw, 22vw",
        "detailAvif": variants.get(f"{full_width}-avif"), "detailWebp": full,
        "width": width, "height": height,
    }


def main() -> None:
    SOURCE.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    products = []
    for index, path in enumerate(sorted(
        (item for item in SOURCE.iterdir() if item.is_file() and item.suffix.casefold() in IMAGE_EXTENSIONS),
        key=lambda item: item.name.casefold(),
    ), start=1):
        name, slug = product_name(path), slugify(product_name(path))
        applications = []
        app_dir = SOURCE / "applications" / slug
        if app_dir.exists():
            for app in sorted((item for item in app_dir.rglob("*") if item.is_file() and item.suffix.casefold() in IMAGE_EXTENSIONS), key=lambda item: item.as_posix().casefold()):
                applications.append(image_record(app, f"{slug}-application-{len(applications)+1}"))
        products.append({
            "id": f"cimstone-{index:03}", "slug": slug, "name": name, "collection": "",
            "mainImage": image_record(path, slug), "description": "", "specifications": {},
            "applications": applications,
        })
    catalogs = []
    shared_catalogs = ROOT / "assets" / "catalog"
    for item in sorted((item for item in [*SOURCE.rglob("*"), *shared_catalogs.glob("*")] if item.is_file() and item.suffix.casefold() == ".pdf" and "cimstone" in item.stem.casefold()), key=lambda item: item.name.casefold()):
        preview = shared_catalogs / "cimstone-catalog-cover.webp"
        catalogs.append({"title": "Cimstone Dijital Kataloğu", "file": item.relative_to(ROOT).as_posix(), "preview": preview.relative_to(ROOT).as_posix() if preview else ""})
    (OUTPUT / "products.json").write_text(json.dumps({"products": products, "catalogs": catalogs}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(products)} Cimstone products and {len(catalogs)} catalogs.")


if __name__ == "__main__":
    main()
