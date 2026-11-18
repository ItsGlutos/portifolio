"""Roteiro de QA do export React (Selenium + Edge headless).

Uso (com `python tools/serve_out.py 4300` rodando):
    python tools/qa_next.py

Cobre: filtro e contagens (incluindo cartões revelados após a troca),
menu mobile (foco, inert, Esc), âncoras, página do PagFlow, reduced motion,
metadados e console.
"""
from __future__ import annotations

import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait

BASE = "http://127.0.0.1:4300"
failures: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    status = "ok  " if condition else "FALHA"
    print(f"[{status}] {name}{(' - ' + detail) if detail else ''}")
    if not condition:
        failures.append(name)


def driver(width: int = 1440, height: int = 900, reduce_motion: bool = False):
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--window-size=1600,1200")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Edge(options=options)
    d.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700},
    )
    if reduce_motion:
        d.execute_cdp_cmd(
            "Emulation.setEmulatedMedia",
            {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]},
        )
    else:
        # Esta máquina tem "reduzir movimento" ligado no sistema; o site precisa
        # ser testado também no modo com movimento.
        d.execute_cdp_cmd(
            "Emulation.setEmulatedMedia",
            {"features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]},
        )
    return d


def wait_ready(d) -> None:
    try:
        WebDriverWait(d, 25).until(
            lambda drv: drv.execute_script("return document.readyState") == "complete"
        )
        WebDriverWait(d, 25).until(
            lambda drv: drv.execute_script("return !!document.getElementById('projects-grid')")
        )
        WebDriverWait(d, 25).until(
            lambda drv: drv.execute_script(
                "return document.documentElement.dataset.hydrated === '1'"
            )
        )
    except Exception:
        print("  diagnóstico:", d.current_url, "|", d.title, "|",
              d.execute_script("return document.documentElement.outerHTML.length"))
        raise
    time.sleep(0.8)


def severe(d) -> list[str]:
    return [e["message"] for e in d.get_log("browser") if "SEVERE" in e["message"]]


def cards(d) -> list[dict]:
    return d.execute_script(
        """return [...document.querySelectorAll('.project')].map(e => {
            const r = e.getBoundingClientRect();
            const visibleTop = Math.max(r.top, 0);
            const visibleBottom = Math.min(r.bottom, innerHeight);
            const ratio = Math.max(0, visibleBottom - visibleTop) / Math.max(r.height, 1);
            return {
                title: (e.querySelector('h3')?.textContent || '').slice(0, 24),
                visible: parseFloat(getComputedStyle(e).opacity) > 0.9,
                onScreen: ratio > 0.2
            };
        })"""
    )


def wait_cards_visible(d, seconds: float = 3.0) -> list[str]:
    """Espera a transição de revelação terminar para os cartões no viewport."""
    end = time.time() + seconds
    pending: list[str] = []
    while time.time() < end:
        pending = [
            item["title"]
            for item in cards(d)
            if item["onScreen"] and not item["visible"]
        ]
        if not pending:
            return []
        time.sleep(0.2)
    return pending


def test_filters(d) -> None:
    wait_ready(d)
    d.execute_script("document.getElementById('projetos').scrollIntoView()")
    time.sleep(1.2)

    state = cards(d)
    check("grade inicial tem 5 cartões", len(state) == 5)
    check("cartões em viewport revelados", any(item["visible"] for item in state))
    check(
        "contadores derivados 05/03/02",
        d.execute_script(
            "return [...document.querySelectorAll('.segmented__count')].map(e=>e.textContent).join(',')"
        )
        == "05,03,02",
    )

    for key, expected in (("dados", 3), ("automacao", 2), ("todos", 5)):
        d.find_element(By.CSS_SELECTOR, f'[data-filter="{key}"]').click()
        time.sleep(1.3)
        state = cards(d)
        check(f"filtro {key} exibe {expected}", len(state) == expected, str(len(state)))
        pending = wait_cards_visible(d)
        check(
            f"filtro {key}: cartões no viewport visíveis",
            not pending,
            str(pending),
        )

    check(
        "aria-pressed acompanha",
        d.find_element(By.CSS_SELECTOR, '[data-filter="todos"]').get_attribute("aria-pressed") == "true",
    )
    check(
        "aria-live anuncia o total",
        d.find_element(By.ID, "projects-count").text.startswith("5"),
        d.find_element(By.ID, "projects-count").text,
    )


def test_mobile_menu() -> None:
    d = driver(390, 844)
    try:
        d.get(BASE + "/")
        wait_ready(d)
        toggle = d.find_element(By.CSS_SELECTOR, ".menu-toggle")
        check("menu começa fechado", toggle.get_attribute("aria-expanded") == "false")
        d.execute_script("arguments[0].click()", toggle)
        time.sleep(0.6)
        check("menu abre", toggle.get_attribute("aria-expanded") == "true")
        check(
            "painel marcado como aberto",
            "is-open" in d.find_element(By.ID, "mobile-nav").get_attribute("class"),
        )
        check(
            "resto da página fica inert",
            d.execute_script("return document.getElementById('conteudo').hasAttribute('inert')"),
        )
        check(
            "rolagem travada",
            "no-scroll" in d.find_element(By.TAG_NAME, "body").get_attribute("class"),
        )
        check(
            "foco entra no painel",
            d.execute_script(
                "return document.getElementById('mobile-nav').contains(document.activeElement)"
            ),
        )
        d.find_element(By.TAG_NAME, "body").send_keys("\ue00c")  # Escape
        time.sleep(0.5)
        check("Esc fecha o menu", toggle.get_attribute("aria-expanded") == "false")
        check(
            "foco volta ao botão",
            d.execute_script("return document.activeElement === document.querySelector('.menu-toggle')"),
        )
        check(
            "inert removido",
            not d.execute_script("return document.getElementById('conteudo').hasAttribute('inert')"),
        )
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()


def test_anchor_scroll() -> None:
    d = driver()
    try:
        d.get(BASE + "/")
        wait_ready(d)
        d.execute_script("document.querySelector('.nav__link[href=\"#projetos\"]').click()")
        time.sleep(2.2)
        y = d.execute_script("return window.scrollY")
        top = d.execute_script("return document.getElementById('projetos').getBoundingClientRect().top")
        check("âncora rola até Projetos", y > 200 and -160 < top < 160, f"y={round(y)} top={round(top)}")
        check(
            "scroll spy marca a seção",
            d.execute_script(
                "return document.querySelector('.nav__link[aria-current=\"true\"]')?.getAttribute('href') === '#projetos'"
            ),
        )
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()


def test_pagflow_notice() -> None:
    """Aviso de mobile: nota no cartão + diálogo antes de abrir a demo."""
    d = driver(390, 844)
    try:
        d.get(BASE + "/")
        wait_ready(d)
        d.execute_script(
            "document.querySelector('.project--showcase').scrollIntoView({block: 'center'})"
        )
        time.sleep(0.8)
        check(
            "aviso do PagFlow visível no mobile",
            d.execute_script(
                "return getComputedStyle(document.querySelector('.project__notice')).display"
            )
            == "flex",
        )
        d.execute_script("document.querySelector('.project__cta').click()")
        time.sleep(0.5)
        check(
            "diálogo de aviso abre",
            d.execute_script("return document.querySelector('dialog.pagflow-dialog').open"),
        )
        check(
            "foco entra no diálogo",
            d.execute_script(
                "return document.querySelector('dialog.pagflow-dialog').contains(document.activeElement)"
            ),
        )
        d.execute_script(
            "document.querySelector('.pagflow-dialog__actions .btn--ghost').click()"
        )
        time.sleep(0.4)
        check(
            "diálogo fecha em 'Agora não'",
            d.execute_script("return document.querySelector('dialog.pagflow-dialog').open === false"),
        )
        check(
            "foco volta ao CTA",
            d.execute_script(
                "return document.activeElement === document.querySelector('.project__cta')"
            ),
        )
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))

        h = driver()
        try:
            h.get(BASE + "/")
            wait_ready(h)
            check(
                "aviso do PagFlow oculto no desktop",
                h.execute_script(
                    "return getComputedStyle(document.querySelector('.project__notice')).display"
                )
                == "none",
            )
            check(
                "diálogo fechado por padrão",
                h.execute_script("return document.querySelector('dialog.pagflow-dialog').open === false"),
            )
        finally:
            h.quit()
    finally:
        d.quit()


def test_pagflow() -> None:
    d = driver()
    try:
        d.get(f"{BASE}/pagflow/")
        WebDriverWait(d, 25).until(
            lambda drv: drv.execute_script("return document.readyState") == "complete"
        )
        time.sleep(1.5)
        height = d.execute_script("return document.body.scrollHeight")
        title = d.execute_script("return document.title")
        check("réplica PagFlow responde", height > 400, f"altura={height}")
        check("réplica tem título", bool(title), title[:60])
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()


def test_reduced_motion() -> None:
    d = driver(reduce_motion=True)
    try:
        d.get(BASE + "/")
        wait_ready(d)
        time.sleep(0.8)
        hidden = d.execute_script(
            "return [...document.querySelectorAll('[data-reveal]')].filter(e=>getComputedStyle(e).opacity==='0').length"
        )
        check("reduced: nada fica escondido", hidden == 0, f"{hidden} escondidos")
        check(
            "reduced: Lenis desligado",
            not d.execute_script("return document.documentElement.classList.contains('lenis')"),
        )
        d.find_element(By.CSS_SELECTOR, '[data-filter="automacao"]').click()
        time.sleep(1.0)
        state = cards(d)
        pending = wait_cards_visible(d)
        check(
            "reduced: cartões filtrados visíveis no viewport",
            len(state) == 2 and not pending,
            str(pending),
        )
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()


def test_animations() -> None:
    """Regressão: reveal e entrada do hero não podem voltar a ficar estáticos."""
    d = driver()
    try:
        d.get(BASE + "/")
        wait_ready(d)
        d.execute_script("document.getElementById('projetos').scrollIntoView()")
        time.sleep(1.2)
        info = d.execute_script(
            """
            const lead = document.querySelector('.hero__lead');
            const line = document.querySelector('.hero__title .line > span');
            const cards = [...document.querySelectorAll('.project')];
            return {
              leadTransition: getComputedStyle(lead).transitionDuration,
              heroAnimation: getComputedStyle(line).animationName,
              cardsWithReveal: cards.filter(c => c.hasAttribute('data-reveal')).length,
              cards: cards.length,
              pendingOnLoad: cards.some(c => c.classList.contains('is-pending'))
            };
            """
        )
        check(
            "reveal tem transição ativa",
            info["leadTransition"] not in ("0s", "0.00001s", ""),
            info["leadTransition"],
        )
        check(
            "título do hero anima linha a linha",
            info["heroAnimation"] == "hero-line",
            info["heroAnimation"],
        )
        check(
            "cartões participam do reveal",
            info["cards"] > 0 and info["cardsWithReveal"] == info["cards"],
            f"{info['cardsWithReveal']}/{info['cards']}",
        )
        check("sem erro de console", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()


def test_meta() -> None:
    d = driver()
    try:
        d.get(BASE + "/")
        wait_ready(d)
        meta = d.execute_script(
            """return {
                canonical: document.querySelector('link[rel=canonical]')?.href || '',
                og: document.querySelector('meta[property="og:image"]')?.content || '',
                jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
                lang: document.documentElement.lang,
                h1: document.querySelectorAll('h1').length
            }"""
        )
        check("um único h1", meta["h1"] == 1, str(meta["h1"]))
        check("canonical presente", bool(meta["canonical"]), meta["canonical"])
        check("og:image presente", bool(meta["og"]), meta["og"])
        check("JSON-LD presente", meta["jsonld"] >= 2, str(meta["jsonld"]))
        check("lang pt-BR", meta["lang"] == "pt-BR", meta["lang"])
    finally:
        d.quit()


def main() -> int:
    print("== filtros (com movimento) ==")
    d = driver()
    try:
        d.get(BASE + "/")
        test_filters(d)
        check("sem erro de console na home", len(severe(d)) == 0, str(severe(d)[:2]))
    finally:
        d.quit()

    print("== menu mobile ==")
    test_mobile_menu()
    print("== âncoras ==")
    test_anchor_scroll()
    print("== pagflow ==")
    test_pagflow_notice()
    test_pagflow()
    print("== reduced motion ==")
    test_reduced_motion()
    print("== animações ==")
    test_animations()
    print("== metadados ==")
    test_meta()

    print()
    if failures:
        print("FALHAS:", len(failures))
        for item in failures:
            print(" -", item)
        return 1
    print("tudo certo")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
