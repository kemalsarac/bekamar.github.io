"""Create responsive WebP variants for Florim award carousel photography."""
from __future__ import annotations
import json
import shutil
from pathlib import Path
from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "optimized" / "florim" / "awards"
VARIANT_EDGES = (800, 1600)
QUALITY = 84
METHOD = 6

SOURCES = {
    "rinascenza-award": ROOT / "assets" / "rinescanza_odul.webp",
    "formatech": ROOT / "assets" / "formatech.jpg",
    "sensietna": ROOT / "assets" / "sensietna.jpg",
    "segnature-cedit": ROOT / "assets" / "Segnature – CEDIT.jpg",
    "sensi": ROOT / "assets" / "sensi.webp",
    # Keep the additional award-related source optimized even though it is not
    # currently one of the six displayed cards.
    "sensiterra": ROOT / "assets" / "sensiterra.jpg",
    "florim-stone-award": next(
        (ROOT / "assets").rglob("784098_stone lucania_1024x768.jpg")
    ),
}


def main() -> None:
    if not features.check("webp"):
        raise SystemExit("Pillow WebP encoder is required")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = {}
    for name, source in SOURCES.items():
        if not source.is_file():
            raise SystemExit(f"Missing source image: {source}")
        for stale in OUTPUT.glob(f"{name}-*.webp"):
            stale.unlink()
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original)
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            width, height = image.size
            variants = []
            last_size = None
            for edge in VARIANT_EDGES:
                actual_edge = min(edge, max(width, height))
                if actual_edge == last_size:
                    continue
                last_size = actual_edge
                variant = image.copy()
                variant.thumbnail((actual_edge, actual_edge), Image.Resampling.LANCZOS)
                target = OUTPUT / f"{name}-{variant.width}.webp"
                if source.suffix.lower() == ".webp" and actual_edge == max(width, height):
                    shutil.copyfile(source, target)
                else:
                    variant.save(target, "WEBP", quality=QUALITY, method=METHOD)
                variants.append({
                    "path": target.relative_to(ROOT).as_posix(),
                    "width": variant.width,
                    "height": variant.height,
                    "bytes": target.stat().st_size,
                })
        records[name] = {
            "source": source.relative_to(ROOT).as_posix(),
            "width": width,
            "height": height,
            "sourceBytes": source.stat().st_size,
            "webp": variants,
        }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    source_bytes = sum(row["sourceBytes"] for row in records.values())
    webp_bytes = sum(item["bytes"] for row in records.values() for item in row["webp"])
    print(f"Optimized {len(records)} source images ({source_bytes:,} source bytes).")
    print(f"Created {sum(len(row['webp']) for row in records.values())} WebP variants ({webp_bytes:,} bytes).")


if __name__ == "__main__":
    main()
