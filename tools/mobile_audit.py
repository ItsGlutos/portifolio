"""Auditoria mobile do export React (Selenium + Edge headless).

Mede o que costuma quebrar em tela pequena e salva capturas por viewport:

- rolagem horizontal (documento mais largo que a viewport);
- elementos que estouram a largura da viewport;
- alvos de toque menores que 44 x 44 px;
- textos com menos de 12 px computados.

Uso (com `python tools/serve_out.py 4300` rodando):
    python tools/mobile_audit.py               # http://127.0.0.1:4300
    python tools/mobile_audit.py http://host:porta

As capturas vão para tools/shots/mobile/.
"""
from __future__ import annotations

import base64
import json
import sys
import time
from pathlib import Path

# O console do Windows abre em cp1252; sem isso, um "↑" derruba o relatório.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "shots" / "mobile"
ARGS = [a for a in sys.argv[1:] if not a.startswith("-")]
FLAGS = {a for a in sys.argv[1:] if a.startswith("-")}
URL = next((a for a in ARGS if a.startswith("http")), "http://127.0.0.1:4300")
ONLY_SECTIONS = "--sections" in FLAGS
ONLY = [a for a in ARGS if not a.startswith("http")]

VIEWPORTS = [
    (390, 844, "iphone-390"),
    (360, 780, "android-360"),
    (430, 932, "iphone-430"),
    (768, 1024, "tablet-768"),
    (844, 390, "landscape-844"),
]

# Seções fotografadas na largura real (a página inteira é alta demais para 1 imagem).
SECTIONS = [
    ("#inicio", "hero"),
    ("#sobre", "sobre"),
    ("#projetos", "projetos-topo"),
    (".project--showcase", "pagflow-card"),
    (".project--reading", "medium-card"),
    ("#contato", "contato"),
    (".site-footer", "footer"),
]

# Mede tudo de uma vez e devolve um objeto simples (sem DOM serializado).
AUDIT_JS = r"""
const vw = document.documentElement.clientWidth;
const all = [...document.querySelectorAll('body *')];
const visible = (el) => {
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};
const describe = (el) => {
  const id = el.id ? '#' + el.id : '';
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
    : '';
  return el.tagName.toLowerCase() + id + cls;
};
const overflows = [];
const tiny = [];
const smallText = [];
for (const el of all) {
  if (!visible(el)) continue;
  const r = el.getBoundingClientRect();
  const right = r.right + window.scrollX;
  if (right > vw + 1.5 && el.tagName !== 'CANVAS') {
    const parent = el.parentElement;
    const pr = parent ? parent.getBoundingClientRect() : null;
    if (!pr || pr.right + window.scrollX <= vw + 1.5) {
      overflows.push({ el: describe(el), right: Math.round(right), width: Math.round(r.width) });
    }
  }
  const cs = getComputedStyle(el);
  const interactive = el.matches('a[href], button, input, select, textarea, [role="button"]');
  if (interactive) {
    if ((r.height < 43.5 || r.width < 43.5) && !el.matches('.nav__link, .brand, .mobile-nav__link')) {
      tiny.push({ el: describe(el), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || '').trim().slice(0, 42) });
    }
  }
  const fs = parseFloat(cs.fontSize);
  if (fs > 0 && fs < 12 && (el.textContent || '').trim().length > 1) {
    smallText.push({ el: describe(el), fs: fs, text: (el.textContent || '').trim().slice(0, 42) });
  }
}
const uniq = (list, key) => [...new Map(list.map((item) => [item[key], item])).values()];
return {
  url: location.href,
  viewport: { w: vw, h: window.innerHeight },
  doc: {
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    bodyScrollWidth: document.body.scrollWidth,
  },
  overflowX: overflows.slice(0, 14),
  tinyTargets: uniq(tiny, 'el').slice(0, 20),
  smallText: uniq(smallText, 'el').slice(0, 20),
  hydrated: document.documentElement.dataset.hydrated === '1',
};
"""


def driver(width: int, height: int) -> webdriver.Edge:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--window-size=1600,1200")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Edge(options=options)
    d.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": 2, "mobile": width < 700},
    )
    d.execute_cdp_cmd(
        "Emulation.setEmulatedMedia",
        {"features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]},
    )
    return d


def wait_ready(d: webdriver.Edge, timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if d.execute_script("return document.readyState") == "complete" and d.execute_script(
            "return document.documentElement.dataset.hydrated === '1'"
        ):
            return True
        time.sleep(0.1)
    return False


def scroll_through(d: webdriver.Edge) -> None:
    """Percorre a página para disparar os observers de revelação."""
    height = d.execute_script("return document.documentElement.scrollHeight")
    for y in range(0, height, 420):
        d.execute_script("window.scrollTo(0, arguments[0])", y)
        time.sleep(0.04)
    d.execute_script("window.scrollTo(0, document.documentElement.scrollHeight)")
    time.sleep(0.4)
    d.execute_script("window.scrollTo(0, 0)")
    time.sleep(0.5)


def capture_viewport(d: webdriver.Edge, name: str) -> Path:
    result = d.execute_cdp_cmd(
        "Page.captureScreenshot",
        {"format": "png", "fromSurface": True, "captureBeyondViewport": False},
    )
    path = OUT / f"{name}.png"
    path.write_bytes(base64.b64decode(result["data"]))
    return path


def capture_sections(d: webdriver.Edge, prefix: str) -> list[str]:
    saved = []
    for selector, label in SECTIONS:
        found = d.execute_script(
            """
            const el = document.querySelector(arguments[0]);
            if (!el) return false;
            const top = el.getBoundingClientRect().top + window.scrollY - 8;
            window.scrollTo(0, Math.max(0, top));
            return true;
            """,
            selector,
        )
        if not found:
            continue
        time.sleep(0.45)
        path = capture_viewport(d, f"{prefix}-{label}")
        saved.append(path.name)
    d.execute_script("window.scrollTo(0, 0)")
    return saved


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    failures = 0
    for width, height, name in VIEWPORTS:
        if ONLY and name not in ONLY:
            continue
        d = driver(width, height)
        try:
            d.get(URL)
            ready = wait_ready(d)
            severe = [e["message"] for e in d.get_log("browser") if "SEVERE" in e["message"]]
            print(f"\n=== {name} ({width}x{height}) ===")
            if not ready:
                failures += 1
                print("  hidratação NÃO terminou")
                for message in severe[:4]:
                    print(f"    console: {message}")
                continue
            scroll_through(d)
            data = d.execute_script(AUDIT_JS)
            print(f"  doc: {data['doc']}")
            scrolls_x = data["doc"]["scrollWidth"] > width
            print(
                "  rolagem horizontal: "
                + ("SIM" if scrolls_x else "não")
                + f" (doc {data['doc']['scrollWidth']}px / body {data['doc']['bodyScrollWidth']}px)"
            )
            if scrolls_x:
                failures += 1
                print("  estouram a largura (geram rolagem):")
                for item in data["overflowX"]:
                    print(f"    - {item['el']}  right={item['right']} w={item['width']}")
            elif data["overflowX"]:
                print("  excedem a caixa mas ficam recortados (decorativo):")
                for item in data["overflowX"]:
                    print(f"    - {item['el']}  right={item['right']} w={item['width']}")
            if data["tinyTargets"]:
                failures += 1
                print("  alvos < 44px:")
                for item in data["tinyTargets"]:
                    print(f"    - {item['el']} {item['w']}x{item['h']} '{item['text']}'")
            if data["smallText"]:
                print("  texto < 12px (informativo):")
                for item in data["smallText"][:12]:
                    print(f"    - {item['el']} {item['fs']}px '{item['text']}'")
            if severe:
                failures += 1
                print(f"  console severo: {severe[:3]}")
            if ONLY_SECTIONS:
                saved = capture_sections(d, name)
                print(f"  capturas: {', '.join(saved)}")
            (OUT / f"{name}.json").write_text(
                json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
            )
        finally:
            d.quit()
    print(f"\n{'ok' if failures == 0 else 'pendências: ' + str(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
