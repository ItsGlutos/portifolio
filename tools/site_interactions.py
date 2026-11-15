"""Interações e auditoria visual da direção A (Selenium + Edge)."""
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


def driver(w: int, h: int) -> webdriver.Edge:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--window-size=1600,1200")
    d = webdriver.Edge(options=opts)
    d.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
        "width": w, "height": h, "deviceScaleFactor": 1, "mobile": w < 700,
    })
    return d


def settle(d: webdriver.Edge) -> None:
    d.execute_async_script("""
      const done = arguments[0];
      Promise.race([
        document.fonts.ready.then(() => true),
        new Promise(r => setTimeout(() => r(false), 3000))
      ]).then(() => setTimeout(done, 1200));
    """)
    d.execute_script("document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-visible'))")
    time.sleep(0.3)


def move(d: webdriver.Edge, x: int, y: int) -> None:
    for kind in ("mouseMoved",):
        d.execute_cdp_cmd("Input.dispatchMouseEvent", {"type": kind, "x": x, "y": y})


def shot(d: webdriver.Edge, name: str) -> None:
    d.save_screenshot(str(OUT / f"{name}.png"))


d = driver(1440, 900)
try:
    d.get(URL)
    settle(d)
    print("hero font:", d.execute_script("getComputedStyle(document.querySelector('.hero__title')).fontFamily"))
    print("h1 size:", d.execute_script("getComputedStyle(document.querySelector('.hero__title')).fontSize"))
    print("overflow:", d.execute_script("return {doc:document.documentElement.scrollWidth, win:innerWidth}"))
    # constelação no ponteiro, em área de céu
    move(d, 1030, 300)
    time.sleep(0.6)
    shot(d, "hero-constellation")
    # tilt no retrato
    move(d, 1090, 450)
    time.sleep(0.6)
    shot(d, "hero-tilt")
    # spotlight em um cartão
    d.execute_script("document.getElementById('projetos').scrollIntoView()")
    time.sleep(0.5)
    d.execute_script("window.scrollBy(0, 300)")
    time.sleep(0.4)
    move(d, 500, 600)
    time.sleep(0.5)
    shot(d, "projetos-spotlight")
    print("contact rows:", d.execute_script("""
      const l=document.querySelector('.contact__panel .section-label');
      const h=document.querySelector('.contact__panel h2');
      return {label:Math.round(l.getBoundingClientRect().y), h2:Math.round(h.getBoundingClientRect().y)};
    """))
    logs = [e["message"] for e in d.get_log("browser")]
    print("severe:", [m for m in logs if "SEVERE" in m][:4])
finally:
    d.quit()

for w, h, tag in ((800, 900, "w800"), (390, 844, "w390")):
    d = driver(w, h)
    try:
        d.get(URL)
        settle(d)
        print(tag, "overflow:", d.execute_script("return {doc:document.documentElement.scrollWidth, win:innerWidth}"))
        print(tag, "header:", d.execute_script("""
          const c=document.querySelector('.header__cta'), s=document.querySelector('.status'), n=document.querySelector('.nav');
          const vis=e=>e?getComputedStyle(e).display!=='none':false;
          return {cta:vis(c), status:vis(s), nav:vis(n)};
        """))
        shot(d, f"{tag}-hero")
    finally:
        d.quit()
print("ok")
