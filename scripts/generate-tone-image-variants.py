"""Create responsive WebP/AVIF derivatives for the original T-ONE photos.

Original images in the T-ONE source folders are read-only inputs. Output is written to assets/optimized/tone with a JSON manifest.
Requires Pillow with WebP and AVIF support (Pillow 11+).
"""

from __future__ import annotations

import json
import re
import warnings
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized" / "tone"
ASSETS = ROOT / "assets"
SOURCES = {
    "products": next(path for path in ASSETS.iterdir() if path.name.startswith("Vesika")),
    "applications": next(path for path in ASSETS.iterdir() if path.name.startswith("Mekan")),
}
THUMBNAIL_MAX_EDGE = 1200
DETAIL_MAX_EDGE = 1600


def slugify(value: str) -> str:
    value = value.lower().replace("\u0131", "i").replace("\u015f", "s").replace("\u011f", "g")
    value = value.replace("\u00fc", "u").replace("\u00f6", "o").replace("\u00e7", "c")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def save_variant(image: Image.Image, target: Path, format_name: str) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if format_name == "WEBP":
        image.save(target, "WEBP", quality=80, method=6)
    else:
        image.save(target, "AVIF", quality=40, speed=8)


def main() -> None:
    if not Image.registered_extensions().get(".webp"):
        raise SystemExit("Pillow WebP encoder is required")
    if not Image.registered_extensions().get(".avif"):
        raise SystemExit("Pillow AVIF encoder is required")

    manifest: dict[str, list[dict[str, object]]] = {key: [] for key in SOURCES}
    warnings.filterwarnings("ignore", category=Image.DecompressionBombWarning)
    Image.MAX_IMAGE_PIXELS = None

    for category, source_dir in SOURCES.items():
        for source in sorted(source_dir.iterdir()):
            if not source.is_file() or source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                continue

            stem = slugify(source.stem)
            thumb_path = OUTPUT / category / f"{stem}-1200.webp"
            small_thumb_path = OUTPUT / category / f"{stem}-800.webp"
            avif_path = OUTPUT / category / f"{stem}-1600.avif"
            webp_path = OUTPUT / category / f"{stem}-1600.webp"
            with Image.open(source) as original:
                width, height = original.size
                if original.getexif().get(274) in {6, 8}:
                    width, height = height, width
                complete = thumb_path.is_file() and webp_path.is_file()
                if not complete:
                    image = ImageOps.exif_transpose(original).convert("RGB")
                    width, height = image.size
                    thumb = image.copy()
                    thumb.thumbnail((THUMBNAIL_MAX_EDGE, THUMBNAIL_MAX_EDGE), Image.Resampling.LANCZOS)
                    save_variant(thumb, thumb_path, "WEBP")

                    detail = image.copy()
                    detail.thumbnail((DETAIL_MAX_EDGE, DETAIL_MAX_EDGE), Image.Resampling.LANCZOS)
                    save_variant(detail, avif_path, "AVIF")
                    save_variant(detail, webp_path, "WEBP")
                    if avif_path.stat().st_size >= webp_path.stat().st_size:
                        avif_path.unlink()

            avif_url = avif_path.relative_to(ROOT).as_posix() if avif_path.is_file() else None
            if not small_thumb_path.is_file():
                with Image.open(thumb_path) as thumbnail_image:
                    small_thumbnail = thumbnail_image.copy()
                    small_thumbnail.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    save_variant(small_thumbnail, small_thumb_path, "WEBP")
            with Image.open(thumb_path) as thumbnail_image, Image.open(webp_path) as detail_image:
                thumbnail_width = thumbnail_image.width
                thumbnail_height = thumbnail_image.height
                detail_width = detail_image.width
                detail_height = detail_image.height
            with Image.open(small_thumb_path) as small_thumbnail_image:
                small_thumbnail_width = small_thumbnail_image.width
                small_thumbnail_height = small_thumbnail_image.height

            thumbnail_url = thumb_path.relative_to(ROOT).as_posix()
            small_thumbnail_url = small_thumb_path.relative_to(ROOT).as_posix()
            detail_url = webp_path.relative_to(ROOT).as_posix()

            manifest[category].append({
                "name": source.stem,
                "source": source.relative_to(ROOT).as_posix(),
                "width": width,
                "height": height,
                "thumbnail": thumbnail_url,
                "thumbnailWidth": thumbnail_width,
                "thumbnailHeight": thumbnail_height,
                "smallThumbnail": small_thumbnail_url,
                "smallThumbnailWidth": small_thumbnail_width,
                "smallThumbnailHeight": small_thumbnail_height,
                "detailWidth": detail_width,
                "detailHeight": detail_height,
                "cardSrcset": f"{small_thumbnail_url} {small_thumbnail_width}w, {thumbnail_url} {thumbnail_width}w",
                "cardSizes": "(max-width: 680px) 46vw, (max-width: 1000px) 31vw, 22vw",
                "detailAvif": avif_url,
                "detailWebp": detail_url,
            })
            print(f"Optimized {category}: {source.name}")

    manifest_path = OUTPUT / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {manifest_path.relative_to(ROOT)} ({sum(map(len, manifest.values()))} originals)")


if __name__ == "__main__":
    main()

