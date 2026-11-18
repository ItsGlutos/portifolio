"""Monta imagens de antes/depois lado a lado para revisão visual."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / "shots"
OUT = SHOTS / "compare"

PAIRS = [
    ("w320", "01-hero-topo.png", "320 — hero (título e header)"),
    ("w320", "02-hero-visual.png", "320 — cartão do retrato"),
    ("w390", "10-menu-aberto.png", "390 — menu aberto"),
    ("w390", "09-footer.png", "390 — rodapé"),
    ("w390", "06-pagflow-corpo.png", "390 — cartão do PagFlow"),
    ("land844", "01-hero-topo.png", "844x390 — hero em paisagem"),
]


def label(img: Image.Image, text: str, height: int = 44) -> Image.Image:
    canvas = Image.new("RGB", (img.width, img.height + height), (8, 16, 28))
    canvas.paste(img, (0, height))
    draw = ImageDraw.Draw(canvas)
    draw.text((14, 14), text, fill=(200, 225, 250))
    return canvas


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for viewport, name, title in PAIRS:
        before = SHOTS / "probe-before" / viewport / name
        after = SHOTS / "probe" / viewport / name
        if not before.exists() or not after.exists():
            print(f"pular {viewport}/{name}")
            continue
        a = label(Image.open(before).convert("RGB"), f"ANTES — {title}", 40)
        b = label(Image.open(after).convert("RGB"), f"DEPOIS — {title}", 40)
        height = max(a.height, b.height)
        gap = 16
        canvas = Image.new("RGB", (a.width + b.width + gap, height), (5, 10, 18))
        canvas.paste(a, (0, 0))
        canvas.paste(b, (a.width + gap, 0))
        target = OUT / f"{viewport}-{name}"
        canvas.save(target)
        print(f"{target.name}  {canvas.width}x{canvas.height}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
