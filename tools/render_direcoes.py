"""Renderiza as três direções fora do canvas, em 1440x1024, com assets locais."""
from __future__ import annotations

import base64
import re
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "designs" / "portfolio-direcoes" / "project"
ASSETS = SRC / "assets"
OUT = Path(__file__).resolve().parent / "shots" / "direcoes"
TMP = Path(__file__).resolve().parent / "render"
TMP.mkdir(exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

BOARDS = ["A-Orbita", "B-Instrumento", "C-Aurora"]


def asset_url(match: re.Match[str]) -> str:
    ident = match.group(1)
    for f in ASSETS.glob(ident + ".*"):
        return "file:///" + str(f).replace("\\", "/")
    return match.group(0)


def prepare(name: str) -> Path:
    html = (SRC / f"{name}.dc.html").read_text(encoding="utf-8")
    html = re.sub(r"/_blob/([0-9a-f]{32})", asset_url, html)
    html = html.replace('<script src="./support.js"></script>', "")
    html = re.sub(r'<script type="text/x-dc"[\s\S]*?</script>', "", html)
    dest = TMP / f"{name}.html"
    dest.write_text(html, encoding="utf-8")
    return dest


def driver_for(w: int, h: int) -> webdriver.Edge:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--window-size=1600,1200")
    d = webdriver.Edge(options=opts)
    d.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
        "width": w, "height": h, "deviceScaleFactor": 1, "mobile": False,
    })
    return d


def snap(d: webdriver.Edge, name: str) -> None:
    res = d.execute_cdp_cmd("Page.captureScreenshot", {
        "format": "png", "fromSurface": True,
        "clip": {"x": 0, "y": 0, "width": 1440, "height": 1024, "scale": 1},
    })
    (OUT / f"{name}.png").write_bytes(base64.b64decode(res["data"]))


def move(d: webdriver.Edge, x: int, y: int) -> None:
    d.execute_cdp_cmd("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": x, "y": y})


for name in BOARDS:
    path = prepare(name)
    d = driver_for(1440, 1024)
    try:
        d.get(path.as_uri())
        d.execute_async_script("""
          const done = arguments[0];
          Promise.all([document.fonts.ready]).then(() => setTimeout(done, 2200));
        """)
        snap(d, name)
        if name == "A-Orbita":
            move(d, 380, 860)
            time.sleep(0.8)
            snap(d, "A-orbita-hover")
        if name == "B-Instrumento":
            move(d, 400, 716)
            time.sleep(0.9)
            snap(d, "B-instrumento-hover")
        if name == "C-Aurora":
            d.execute_script("document.getElementById('next').click()")
            time.sleep(1.0)
            snap(d, "C-aurora-next")
    finally:
        d.quit()
    print("ok", name)
