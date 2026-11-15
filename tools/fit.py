"""Mede o enquadramento da réplica em vários tamanhos de tela."""
from __future__ import annotations

import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

URL = (Path(__file__).resolve().parent.parent / "pagflow" / "index.html").as_uri()
SIZES = [(1920, 1220), (1600, 1040), (1440, 1040), (1440, 940), (1366, 900), (1280, 940), (390, 844)]


def run(w: int, h: int) -> None:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=%d,%d" % (w, h))
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--allow-file-access-from-files")
    d = webdriver.Edge(options=opts)
    try:
        d.set_window_size(w, h)
        d.get(URL)
        time.sleep(1.2)
        data = d.execute_script(
            "const b=document.getElementById('board');"
            "const f=document.getElementById('frameWrap').getBoundingClientRect();"
            "return {s: getComputedStyle(b).getPropertyValue('--s').trim(),"
            " app: [Math.round(f.width), Math.round(f.height)],"
            " top: Math.round(f.top), bottom: Math.round(f.bottom),"
            " vh: window.innerHeight, vw: window.innerWidth,"
            " pageH: document.body.scrollHeight,"
            " overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,"
            " compact: document.body.classList.contains('is-compact')};"
        )
        print(f"{w}x{h}:", data)
    finally:
        d.quit()


if __name__ == "__main__":
    for w, h in SIZES:
        run(w, h)
