"""QA de interação da réplica (Selenium + Edge headless).

Roda o roteiro de cliques que o visitante faria e salva capturas em tools/shots/qa-*.
"""
from __future__ import annotations

import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent / "pagflow"
URL = (ROOT / "index.html").as_uri()
OUT = Path(__file__).resolve().parent / "shots"


def driver_for(w: int, h: int):
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=%d,%d" % (w, h))
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--allow-file-access-from-files")
    opts.add_argument("--hide-scrollbars")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Edge(options=opts)
    d.set_window_size(w, h)
    return d


def shot(d, name: str, full: bool = False) -> None:
    if full:
        d.execute_script(
            "window.__h = document.body.scrollHeight;"
            "document.documentElement.style.height = window.__h + 'px';"
        )
    d.save_screenshot(str(OUT / f"qa-{name}.png"))


def main() -> int:
    d = driver_for(1440, 900)
    try:
        d.get(URL)
        time.sleep(1.4)
        info = d.execute_script(
            "const b=document.getElementById('board');"
            "return {s: getComputedStyle(b).getPropertyValue('--s').trim(),"
            " boardW: b.getBoundingClientRect().width,"
            " docW: document.documentElement.scrollWidth,"
            " innerW: window.innerWidth,"
            " pageH: document.body.scrollHeight,"
            " innerH: window.innerHeight};"
        )
        print("1440x900:", info)
        shot(d, "desktop")

        # alternador escuro -> claro (evento com coordenada real; o clique do
        # Selenium erra o alvo por causa do transform: scale do tabuleiro)
        d.execute_script("""
          const t = document.getElementById('themeToggle');
          const r = t.getBoundingClientRect();
          t.dispatchEvent(new MouseEvent('click', {bubbles: true, detail: 1,
            clientX: r.left + r.width * 0.8, clientY: r.top + r.height / 2}));
        """)
        time.sleep(0.6)
        print("tema após toggle:", d.execute_script("return document.getElementById('app').dataset.theme"))
        shot(d, "claro")

        # configurações: código inválido e válido
        d.find_element(By.ID, "btnConfig").click()
        time.sleep(0.45)
        code = d.find_element(By.ID, "codeInput")
        code.send_keys("gremlin")
        d.find_element(By.ID, "btnAtivar").click()
        time.sleep(0.3)
        print("feedback inválido:", d.find_element(By.ID, "feedback").text.replace("\n", " | "))
        shot(d, "codigo-erro")
        code.clear()
        code.send_keys("Vaporwave")
        d.find_element(By.ID, "btnAtivar").click()
        time.sleep(0.6)
        print("feedback válido:", d.find_element(By.ID, "feedback").text.replace("\n", " | "))
        print("pill:", d.find_element(By.ID, "pillCurrent").text)
        shot(d, "codigo-ok")
        d.execute_script("document.querySelectorAll('.tab')[1].click()")
        time.sleep(0.4)
        shot(d, "aparencia-pos-codigo")

        # pergunta: esquecer temas
        d.execute_script("document.querySelectorAll('.tab')[4].click()")
        time.sleep(0.3)
        d.find_element(By.ID, "btnEsquecer").click()
        time.sleep(0.4)
        shot(d, "pergunta-esquecer")
        d.find_element(By.ID, "msgCancel").click()
        time.sleep(0.3)
        d.find_element(By.ID, "settingsClose").click()
        time.sleep(0.4)

        # restaurar padrão do corpo (pergunta dentro da tela de envio)
        d.execute_script("document.querySelectorAll('.switch__btn')[1].click()")
        time.sleep(0.5)
        d.find_element(By.ID, "btnRestaurar").click()
        time.sleep(0.4)
        shot(d, "pergunta-restaurar")
        d.find_element(By.ID, "msgOk").click()
        time.sleep(0.4)

        # foco por teclado: tab até o gerar
        d.execute_script("document.getElementById('btnLimpar').focus()")
        time.sleep(0.2)
        active = d.execute_script("return document.activeElement.id || document.activeElement.className")
        print("foco:", active)
        shot(d, "foco")

        logs = [e["message"] for e in d.get_log("browser")]
        errs = [m for m in logs if "SEVERE" in m or "Error" in m]
        print("console severo:", errs[:5])
        print("console total:", len(logs))
    finally:
        d.quit()

    # viewport estreito
    d2 = driver_for(390, 844)
    try:
        d2.get(URL)
        time.sleep(1.4)
        info = d2.execute_script(
            "const b=document.getElementById('board');"
            "return {s: getComputedStyle(b).getPropertyValue('--s').trim(),"
            " boardW: Math.round(b.getBoundingClientRect().width),"
            " docW: document.documentElement.scrollWidth,"
            " innerW: window.innerWidth,"
            " overflowX: document.documentElement.scrollWidth > window.innerWidth};"
        )
        print("390x844:", info)
        shot(d2, "mobile", full=True)
    finally:
        d2.quit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
