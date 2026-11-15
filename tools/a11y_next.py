"""Auditoria de acessibilidade com axe-core no export React.

Uso (com `python tools/serve_out.py 4300` rodando):
    python tools/a11y_next.py

Falha (exit 1) em violação de impacto serious/critical.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

BASE = "http://127.0.0.1:4300"
AXE = Path(__file__).resolve().parent.parent / "web" / "node_modules" / "axe-core" / "axe.min.js"
PAGES = [("/", "home"), ("/pagflow/", "pagflow")]


def driver(width: int = 1440, height: int = 900):
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1600,1200")
    d = webdriver.Edge(options=options)
    d.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700},
    )
    d.execute_cdp_cmd(
        "Emulation.setEmulatedMedia",
        {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]},
    )
    return d


def audit(path: str, label: str, width: int, height: int, open_dialog: bool = False) -> list[dict]:
    d = driver(width, height)
    try:
        d.get(BASE + path)
        time.sleep(2.5)
        if open_dialog:
            # O aviso de mobile do PagFlow só existe com o <dialog> aberto.
            d.execute_script(
                "document.querySelector('.project__cta')?.click()"
            )
            time.sleep(0.8)
        d.execute_script(AXE.read_text(encoding="utf-8"))
        result = d.execute_async_script(
            """
            const done = arguments[0];
            axe.run(document, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }
            }).then(r => done({ violations: r.violations.map(v => ({
                id: v.id, impact: v.impact, help: v.help,
                nodes: v.nodes.length,
                target: v.nodes[0] ? v.nodes[0].target.join(' ') : ''
            })) })).catch(e => done({ error: String(e) }));
            """
        )
        violations = result.get("violations", [])
        serious = [v for v in violations if v["impact"] in {"serious", "critical"}]
        print(f"[{label} {width}px] violações: {len(violations)} | grave/crítica: {len(serious)}")
        for v in violations:
            print(f"   - {v['impact']:8} {v['id']:28} nodes={v['nodes']:<3} {v['help']}")
            if v["target"]:
                print(f"     alvo: {v['target'][:90]}")
        return serious
    finally:
        d.quit()


def main() -> int:
    if not AXE.exists():
        print("axe-core não encontrado em", AXE)
        return 1

    problems = 0
    for path, label in PAGES:
        for width, height in ((1440, 900), (390, 844)):
            problems += len(audit(path, label, width, height))
    problems += len(audit("/", "home+dialog", 390, 844, open_dialog=True))
    print()
    if problems:
        print("FALHA: existem violações graves.")
        return 1
    print("sem violações graves")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
