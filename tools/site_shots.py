"""Capturas do portfólio (Selenium + Edge headless, viewport via CDP).

Uso:
    python site_shots.py
"""
from __future__ import annotations

import base64
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()
OUT = Path(__file__).resolve().parent / "shots" / "site"
OUT.mkdir(parents=True, exist_ok=True)


def driver_for(w: int, h: int) -> webdriver.Edge:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--window-size=1600,1200")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Edge(options=opts)
    d.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
        "width": w, "height": h, "deviceScaleFactor": 1, "mobile": w < 700,
    })
    return d


def settle(d: webdriver.Edge, seconds: float = 1.2) -> None:
    for _ in range(80):
        if d.execute_script("return document.readyState") == "complete":
            break
        time.sleep(0.05)
    d.execute_script("window.scrollTo(0, 0)")
    time.sleep(seconds)
    d.execute_script("document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in'))")
    time.sleep(0.4)


def clip(name: str, x: int, y: int, w: int, h: int, scale: float = 1) -> None:
    pass


def capture(d: webdriver.Edge, name: str, y: int, h: int, full_width: bool = True) -> None:
    d.execute_script("window.scrollTo({top: arguments[0], behavior: 'instant'})", y)
    time.sleep(0.35)
    w = d.execute_script("return document.documentElement.clientWidth")
    res = d.execute_cdp_cmd("Page.captureScreenshot", {
        "format": "png",
        "fromSurface": True,
        "captureBeyondViewport": True,
        "clip": {"x": 0, "y": y, "width": w if full_width else w, "height": h, "scale": 1},
    })
    (OUT / f"{name}.png").write_bytes(base64.b64decode(res["data"]))


def main() -> int:
    d = driver_for(1440, 900)
    try:
        d.get(URL)
        settle(d)
        dims = d.execute_script("return {w: document.documentElement.clientWidth, h: document.body.scrollHeight}")
        print("desktop", dims)
        capture(d, "desktop-full", 0, dims["h"])
        for sel, name in (("#inicio", "desktop-hero"), ("#sobre", "desktop-sobre"),
                          ("#projetos", "desktop-projetos"), (".project--showcase", "desktop-pagflow"),
                          ("#contato", "desktop-contato"), (".site-footer", "desktop-footer")):
            top = d.execute_script("return Math.max(0, document.querySelector(arguments[0]).getBoundingClientRect().top + scrollY - 16)", sel)
            h = min(980, dims["h"] - top)
            capture(d, name, top, h)
        logs = [e["message"] for e in d.get_log("browser")]
        print("console severo:", [m for m in logs if "SEVERE" in m][:5])
    finally:
        d.quit()

    for w, h, tag in ((834, 1112, "tablet"), (390, 844, "mobile")):
        d = driver_for(w, h)
        try:
            d.get(URL)
            settle(d)
            dims = d.execute_script("return {w: document.documentElement.clientWidth, h: document.body.scrollHeight, docW: document.documentElement.scrollWidth}")
            print(tag, dims)
            capture(d, f"{tag}-full", 0, dims["h"])
            for sel, name in (("#inicio", f"{tag}-hero"), ("#projetos", f"{tag}-projetos"),
                              ("#contato", f"{tag}-contato"), (".site-footer", f"{tag}-footer")):
                top = d.execute_script("return Math.max(0, document.querySelector(arguments[0]).getBoundingClientRect().top + scrollY - 12)", sel)
                cap_h = min(h, dims["h"] - top)
                capture(d, name, top, cap_h)
        finally:
            d.quit()
    print("ok", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
