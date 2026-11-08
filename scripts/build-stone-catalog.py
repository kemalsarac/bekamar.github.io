from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {
    "granit": "Granit",
    "marble": "Mermer",
    "onyx": "Onyx",
    "traverten": "Traverten",
}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
SUFFIX = re.compile(r"_\d+_\d+$")


def display_name(filename: str) -> str:
    stem = Path(filename).stem
    stem = SUFFIX.sub("", stem).replace("_", " ").replace("-", " ")
    words = stem.split()
    words = ["Türkiye" if word.casefold() == "turkiye" else word.capitalize() for word in words]
    return " ".join(words)


def main() -> None:
    for folder, stone_type in CATEGORIES.items():
        image_dir = ROOT / "assets" / folder
        products = []
        if image_dir.exists():
            for image in sorted(image_dir.iterdir(), key=lambda path: path.name.casefold()):
                if not image.is_file() or image.suffix.casefold() not in IMAGE_EXTENSIONS:
                    continue
                encoded_name = quote(image.name, safe="-_.~")
                products.append({
                    "name": display_name(image.name),
                    "image": f"../assets/{folder}/{encoded_name}",
                    "type": stone_type,
                    "specifications": {},
                    "applications": [],
                    "documents": [],
                })
        output = image_dir / "products.json"
        output.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{folder}: {len(products)} products -> {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
