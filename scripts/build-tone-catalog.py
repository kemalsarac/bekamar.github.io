"""Build the static T-ONE catalog JSON from the optimized-image manifest."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "optimized" / "tone" / "manifest.json"
OUTPUT = ROOT / "assets" / "optimized" / "tone"


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def image_record(record: dict[str, object]) -> dict[str, object]:
    return {
        "source": record["source"],
        "thumbnail": record["thumbnail"],
        "thumbnailWidth": record["thumbnailWidth"],
        "thumbnailHeight": record["thumbnailHeight"],
        "smallThumbnail": record["smallThumbnail"],
        "smallThumbnailWidth": record["smallThumbnailWidth"],
        "smallThumbnailHeight": record["smallThumbnailHeight"],
        "detailWidth": record["detailWidth"],
        "detailHeight": record["detailHeight"],
        "srcset": record["cardSrcset"],
        "sizes": record["cardSizes"],
        "detailAvif": record["detailAvif"],
        "detailWebp": record["detailWebp"],
        "width": record["width"],
        "height": record["height"],
    }


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    applications_by_product: dict[str, list[dict[str, object]]] = {}
    product_names = {
        normalized(re.sub(r"_162x323cm_12mm$", "", item["name"])): re.sub(
            r"_162x323cm_12mm$", "", item["name"]
        )
        for item in manifest["products"]
    }
    unmatched: list[dict[str, str]] = []

    for application in manifest["applications"]:
        key = normalized(re.sub(r"-v\d+$", "", application["name"], flags=re.I))
        product_name = product_names.get(key)
        if not product_name:
            unmatched.append({
                "image": application["source"],
                "reason": "Filename does not identify one product unambiguously.",
            })
            continue
        applications_by_product.setdefault(product_name, []).append(image_record(application))

    products = []
    for index, item in enumerate(manifest["products"], start=1):
        name = re.sub(r"_162x323cm_12mm$", "", item["name"])
        products.append({
            "id": f"tone-{index:03}",
            "slug": slugify(name),
            "name": name.replace("_", " "),
            "mainImage": image_record(item),
            "description": "",
            "specifications": {"dimensions": "162 × 323 cm", "thickness": "12 mm"},
            "applications": applications_by_product.get(name, []),
        })

    (OUTPUT / "products.json").write_text(
        json.dumps({"products": products}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUTPUT / "unmatched-applications.json").write_text(
        json.dumps(unmatched, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(products)} products; left {len(unmatched)} application photos unmatched.")


if __name__ == "__main__":
    main()
