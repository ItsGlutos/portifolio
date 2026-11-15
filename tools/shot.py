"""Captura de tela da réplica com Edge headless (Selenium).

Uso:
    python shot.py                 # todas as capturas de referência
    python shot.py dark light      # só alguns temas
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent / "pagflow"
URL = (ROOT / "index.html").as_uri()
OUT = Path(__file__).resolve().parent / "shots"
OUT.mkdir(exist_ok=True)

THEMES = ["dark", "light", "graduation", "ozzy", "lana", "acai",
          "vaporwave", "alien", "wolverine", "flowerboy", "natal", "leila"]

UNSCALE = """
const board = document.getElementById('board');
board.style.setProperty('--s', '1');
document.getElementById('frameWrap').style.width = '1280px';
document.getElementById('frameWrap').style.height = '960px';
document.querySelector('.stage').style.height = '984px';
window.__pfCapture = true;
"""


def make_driver(width: int = 1500, height: int = 1500) -> webdriver.Edge:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--window-size=%d,%d" % (width, height))
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--disable-gpu")
    driver = webdriver.Edge(options=opts)
    driver.set_window_size(width, height)
    return driver


def wait_ready(driver: webdriver.Edge) -> None:
    for _ in range(120):
        if driver.execute_script("return document.readyState") == "complete":
            break
        time.sleep(0.05)
    time.sleep(0.7)


def set_theme(driver, key: str) -> None:
    driver.execute_script("document.querySelector('.tbtn[data-key=\"%s\"]').click();" % key)
    time.sleep(0.5)


def board_shot(driver, name: str) -> None:
    el = driver.find_element("id", "board")
    driver.execute_script("document.getElementById('board').scrollIntoView({block:'start'})")
    time.sleep(0.25)
    el.screenshot(str(OUT / f"{name}.png"))


def page_shot(driver, name: str) -> None:
    driver.save_screenshot(str(OUT / f"{name}.png"))


def main() -> int:
    targets = sys.argv[1:] or THEMES
    driver = make_driver()
    try:
        driver.get(URL)
        wait_ready(driver)
        driver.execute_script(UNSCALE)
        time.sleep(0.4)
        for key in targets:
            if key not in THEMES:
                continue
            set_theme(driver, key)
            board_shot(driver, f"tema-{key}")

        if not sys.argv[1:]:
            set_theme(driver, "dark")
            driver.execute_script("document.querySelectorAll('.switch__btn')[1].click()")
            time.sleep(0.5)
            board_shot(driver, "tela-envio")

            driver.execute_script("document.getElementById('btnConfig').click()")
            time.sleep(0.5)
            board_shot(driver, "dialogo-config-codigo")
            for index, name in ((1, "aparencia"), (0, "geral"), (2, "privacidade"), (4, "sobre")):
                driver.execute_script(f"document.querySelectorAll('.tab')[{index}].click()")
                time.sleep(0.4)
                board_shot(driver, f"dialogo-config-{name}")
            driver.execute_script("document.querySelectorAll('.tab')[1].click()")
            time.sleep(0.3)
            driver.find_element("id", "themeGrid").find_elements("css selector", ".theme-card")[3].click()
            time.sleep(0.5)
            board_shot(driver, "tema-via-config")
            driver.execute_script("document.getElementById('btnRestaurarPadrao').click()")
            time.sleep(0.4)
            driver.execute_script("document.getElementById('settingsClose').click()")
            time.sleep(0.4)

            driver.execute_script("document.getElementById('demoReview').click()")
            time.sleep(0.7)
            board_shot(driver, "dialogo-revisao")
            driver.execute_script("document.getElementById('reviewConfirm').click()")
            time.sleep(2.8)
            board_shot(driver, "dialogo-sucesso")
            driver.execute_script("document.getElementById('msgOk').click()")
            time.sleep(0.4)

            driver.execute_script("document.querySelectorAll('.switch__btn')[0].click()")
            time.sleep(0.4)
            driver.execute_script("document.getElementById('btnGerar').click()")
            time.sleep(0.4)
            board_shot(driver, "status-aviso")
            driver.execute_script("document.getElementById('demoFill').click()")
            driver.execute_script("document.getElementById('btnGerar').click()")
            time.sleep(0.7)
            board_shot(driver, "status-processando")
            time.sleep(2.0)
            board_shot(driver, "dialogo-gerado")
            page_shot(driver, "pagina-completa")
        print("ok:", len(list(OUT.glob('*.png'))), "imagens")
    finally:
        driver.quit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
