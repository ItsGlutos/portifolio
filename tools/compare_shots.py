"""Compara as capturas do site estático (legado) e do export React.

Uso:
    python tools/compare_shots.py            # capturas novas + relatório
    python tools/compare_shots.py --url-only  # só o React (http://127.0.0.1:4300)

Saída: tools/shots/compare/{legacy,next}-{w}x{h}.png e um resumo de console.
Requer Edge + Selenium. O servidor do export deve estar em 127.0.0.1:4300.
"""
from __future__ import annotations

import base64
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent
LEGACY = (ROOT / "index.html").as_uri()
NEXT = "http://127.0.0.1:4300/"
OUT = Path(__file__).resolve().parent / "shots" / "compare"
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [(1440, 900, "desktop"), (834, 1112, "tablet"), (390, 844, "mobile")]

SETTLE_JS = """
document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-visible'));
const sky = document.getElementById('sky');
if (sky) sky.style.opacity = '0.9';
"""


def driver_for(width: int, height: int) -> webdriver.Edge:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--force-device-scale-factor=1")
    options.add_argument("--allow-file-access-from-files")
    options.add_argument("--window-size=1600,1200")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    driver = webdriver.Edge(options=options)
    driver.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700},
    )
    return driver


def settle(driver: webdriver.Edge, seconds: float = 1.6) -> None:
    for _ in range(100):
        if driver.execute_script("return document.readyState") == "complete":
            break
        time.sleep(0.05)
    time.sleep(seconds)
    driver.execute_script(SETTLE_JS)
    time.sleep(0.5)


def capture(driver: webdriver.Edge, name: str) -> dict:
    height = driver.execute_script("return document.body.scrollHeight")
    width = driver.execute_script("return document.documentElement.clientWidth")
    result = driver.execute_cdp_cmd(
        "Page.captureScreenshot",
        {
            "format": "png",
            "fromSurface": True,
            "captureBeyondViewport": True,
            "clip": {"x": 0, "y": 0, "width": width, "height": height, "scale": 1},
        },
    )
    (OUT / f"{name}.png").write_bytes(base64.b64decode(result["data"]))
    return {"w": width, "h": height}


def run(url: str, tag: str, widths: list[tuple[int, int, str]]) -> int:
    problems = 0
    for width, height, label in widths:
        driver = driver_for(width, height)
        try:
            driver.get(url)
            settle(driver)
            dims = capture(driver, f"{tag}-{width}")
            severe = [e["message"] for e in driver.get_log("browser") if "SEVERE" in e["message"]]
            print(f"{tag:6} {label:8} {width}x{height}  altura={dims['h']}  erros={len(severe)}")
            for message in severe[:5]:
                print("   ", message[:200])
            problems += len(severe)
        finally:
            driver.quit()
    return problems


def main() -> int:
    only_next = "--url-only" in sys.argv
    problems = 0
    if not only_next:
        problems += run(LEGACY, "legacy", VIEWPORTS)
    problems += run(NEXT, "next", VIEWPORTS)
    print("console severo total:", problems)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
