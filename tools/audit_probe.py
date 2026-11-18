"""Sonda de auditoria mobile: capturas de leitura + geometria detalhada.

Complementa tools/mobile_audit.py (que só mede rolagem/alvos/fonte):
aqui o objetivo é responder "por que a tela parece estranha", medindo
ritmo vertical, quebras de título, recortes de decoração e estado dos
reveals, e gerando imagens para inspeção visual.

Uso (com `python tools/serve_out.py 4300` rodando):
    python tools/audit_probe.py            # tudo
    python tools/audit_probe.py 390        # só um viewport (pela largura)
"""
from __future__ import annotations

import base64
import json
import sys
import time
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "shots" / "probe"
URL = "http://127.0.0.1:4300"
ONLY = [a for a in sys.argv[1:] if not a.startswith("-")]

VIEWPORTS = [
    (320, 568, "w320"),
    (360, 740, "w360"),
    (390, 844, "w390"),
    (430, 932, "w430"),
    (844, 390, "land844"),
]

# Slices de leitura em 390px (deviceScaleFactor 2 para ler tipografia).
SLICES = [
    ("#inicio", "01-hero-topo", 0),
    (".hero__visual", "02-hero-visual", -24),
    ("#sobre", "03-sobre", -8),
    ("#projetos", "04-projetos-topo", -8),
    (".project--showcase", "05-pagflow-cabeca", -8),
    (".project--showcase .project__body", "06-pagflow-corpo", -110),
    (".project--reading", "07-medium", -8),
    ("#contato", "08-contato", -8),
    (".site-footer", "09-footer", -8),
]

METRICS_JS = r"""
const px = (v) => Math.round(v * 10) / 10;
const rect = (el) => { const r = el.getBoundingClientRect(); return {
  x: px(r.x + scrollX), y: px(r.y + scrollY), w: px(r.width), h: px(r.height) }; };
const rectS = (el) => (el ? rect(el) : null);
const one = (sel) => document.querySelector(sel);
const many = (sel) => [...document.querySelectorAll(sel)];
const cs = (el, ...props) => { const s = getComputedStyle(el); return Object.fromEntries(props.map(p => [p, s[p]])); };

const h1 = one('.hero__title') || one('.hero h1');
const lines = h1 ? [...h1.querySelectorAll('.line')].map(l => ({
  text: l.textContent.trim(),
  w: px(l.getBoundingClientRect().width),
  h: px(l.getBoundingClientRect().height),
})) : [];

const sections = many('main > *').map(el => ({
  sel: el.id ? '#' + el.id : '.' + (el.className || '').trim().split(/\s+/).slice(0, 2).join('.'),
  ...rect(el),
  padTop: cs(el, 'paddingTop', 'paddingBottom').paddingTop,
  padBottom: cs(el, 'paddingBottom').paddingBottom,
}));

const notice = one('.project__notice');
const noticeCs = notice ? cs(notice, 'display', 'fontSize', 'lineHeight', 'color', 'marginTop') : null;

const card = one('.project--showcase');
const cardParts = card ? {
  card: rect(card),
  body: rectS(card.querySelector('.project__body')),
  index: rectS(card.querySelector('.project__index')),
  status: rectS(card.querySelector('.project__status')),
  iconWrap: rectS(card.querySelector('.project__icon-wrap')),
  icon: rectS(card.querySelector('.project__icon')),
  halo: rectS(card.querySelector('.project__halo')),
  h3: card.querySelector('h3') ? cs(card.querySelector('h3'), 'fontSize', 'lineHeight') : null,
  cta: rectS(card.querySelector('.project__cta')),
  foot: rectS(card.querySelector('.project__foot')),
} : null;

const headers = many('.site-header').map(el => ({ ...rect(el), ...cs(el, 'height', 'paddingTop') }));
const fixed = many('body *').filter(el => getComputedStyle(el).position === 'fixed')
  .slice(0, 8).map(el => ({
    sel: el.id ? '#' + el.id : '.' + (el.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.'),
    ...rect(el),
  }));

const smallText = many('body *').filter(el => {
  if (!(el.textContent || '').trim()) return false;
  if (el.children.length) return false;
  const s = getComputedStyle(el);
  if (s.display === 'none' || s.visibility === 'hidden') return false;
  return parseFloat(s.fontSize) < 12;
}).slice(0, 24).map(el => ({
  text: (el.textContent || '').trim().slice(0, 40),
  fs: px(parseFloat(getComputedStyle(el).fontSize)),
  lh: getComputedStyle(el).lineHeight,
  color: getComputedStyle(el).color,
  ls: getComputedStyle(el).letterSpacing,
  ...rect(el),
}));

const unrevealed = many('[data-reveal]').filter(el => !el.classList.contains('is-visible')).map(el => ({
  sel: el.className || el.tagName, ...rect(el),
}));

const overflowEls = many('body *').filter(el => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && (r.right + scrollX) > document.documentElement.clientWidth + 1;
}).slice(0, 10).map(el => ({
  sel: el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + (el.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.'),
  right: px(el.getBoundingClientRect().right + scrollX),
  w: px(el.getBoundingClientRect().width),
}));

const tagRows = (() => {
  const tags = many('.project--showcase .project__tags .tag');
  const tops = new Set(tags.map(t => Math.round(t.getBoundingClientRect().top)));
  return { count: tags.length, rows: tops.size, widths: tags.map(t => px(t.getBoundingClientRect().width)) };
})();

return {
  viewport: { w: document.documentElement.clientWidth, h: innerHeight, dpr: devicePixelRatio },
  doc: { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight },
  bodyBg: cs(document.body, 'backgroundAttachment', 'backgroundColor'),
  header: headers,
  fixed,
  h1: h1 ? { ...cs(h1, 'fontSize', 'lineHeight', 'letterSpacing', 'maxWidth'), ...rect(h1), lines } : null,
  hero: one('#inicio') ? { ...rect(one('#inicio')), ...cs(one('#inicio'), 'paddingTop', 'minHeight') } : null,
  portrait: one('.portrait') ? rect(one('.portrait')) : null,
  orbits: many('.orbit').map(el => ({ ...rect(el), ...cs(el, 'width', 'height') })),
  sections,
  card: cardParts,
  notice: noticeCs ? { ...noticeCs, ...rect(notice) } : null,
  tagRows,
  smallText,
  unrevealed,
  overflowEls,
  sectionGap: (() => {
    const secs = many('main > *').map(el => el.getBoundingClientRect());
    return secs.slice(0, -1).map((r, i) => px(secs[i + 1].top - r.bottom));
  })(),
};
"""


def driver(width: int, height: int, scale: int = 2) -> webdriver.Edge:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--window-size=1600,1200")
    d = webdriver.Edge(options=options)
    d.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {"width": width, "height": height, "deviceScaleFactor": scale, "mobile": width < 700},
    )
    return d


def wait_ready(d: webdriver.Edge, timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if d.execute_script("return document.documentElement.dataset.hydrated === '1'"):
            return True
        time.sleep(0.1)
    return False


def scroll_through(d: webdriver.Edge) -> None:
    # O site usa `scroll-behavior: smooth`; sem desligar, o scroll programático
    # vira animação e a medição pega a página no meio do caminho.
    d.execute_script("document.documentElement.style.scrollBehavior = 'auto'")
    height = d.execute_script("return document.documentElement.scrollHeight")
    for y in range(0, height, 360):
        d.execute_script("window.scrollTo(0, arguments[0])", y)
        time.sleep(0.05)
    d.execute_script("window.scrollTo(0, document.documentElement.scrollHeight)")
    time.sleep(0.5)
    d.execute_script("window.scrollTo(0, 0)")
    time.sleep(0.6)


HIDE_FIXED_CSS = """
.site-header, .progress, .skip-link, #sky, .mobile-nav { visibility: hidden !important; }
"""


def shot(d: webdriver.Edge, path: Path, beyond: bool = False) -> Path:
    data = d.execute_cdp_cmd(
        "Page.captureScreenshot",
        {"format": "png", "fromSurface": True, "captureBeyondViewport": beyond},
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(base64.b64decode(data["data"]))
    return path


def run(width: int, height: int, name: str) -> dict:
    d = driver(width, height)
    try:
        d.get(URL)
        ready = wait_ready(d)
        scroll_through(d)
        data = d.execute_script(METRICS_JS)
        data["hydrated"] = ready
        # Página inteira em 1x, com os elementos fixos escondidos: senão o CDP
        # pinta o header na posição do scroll e a imagem mente.
        inner = driver(width, height, scale=1)
        try:
            inner.execute_cdp_cmd(
                "Emulation.setDeviceMetricsOverride",
                {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700},
            )
            inner.get(URL)
            wait_ready(inner)
            scroll_through(inner)
            inner.execute_script(
                "const s=document.createElement('style'); s.textContent=arguments[0]; document.head.appendChild(s);",
                HIDE_FIXED_CSS,
            )
            time.sleep(0.3)
            shot(inner, OUT / name / "00-full.png", beyond=True)
        finally:
            inner.quit()
        return data
    finally:
        d.quit()


def run_slices(width: int, height: int, name: str) -> list[str]:
    d = driver(width, height)
    saved = []
    try:
        d.get(URL)
        wait_ready(d)
        scroll_through(d)
        for selector, label, offset in SLICES:
            ok = d.execute_script(
                """
                const el = document.querySelector(arguments[0]);
                if (!el) return false;
                const top = el.getBoundingClientRect().top + scrollY + arguments[1];
                window.scrollTo(0, Math.max(0, top));
                return true;
                """,
                selector,
                offset,
            )
            if not ok:
                continue
            time.sleep(0.5)
            shot(d, OUT / name / f"{label}.png")
            saved.append(label)
        # menu aberto
        d.execute_script(
            "const b=document.querySelector('.menu-toggle'); if(b) b.click();"
        )
        time.sleep(0.6)
        shot(d, OUT / name / "10-menu-aberto.png")
        saved.append("menu")
        d.execute_script(
            "const b=document.querySelector('.menu-toggle'); if(b&&b.getAttribute('aria-expanded')==='true') b.click();"
        )
        time.sleep(0.5)
        # diálogo do PagFlow
        opened = d.execute_script(
            """
            const a = document.querySelector('.project--showcase .project__cta');
            if (!a) return 'sem-cta';
            a.click();
            return document.querySelector('dialog[open]') ? 'aberto' : 'nao-abriu';
            """
        )
        time.sleep(0.7)
        if opened == "aberto":
            shot(d, OUT / name / "11-dialogo-pagflow.png")
            saved.append("dialogo")
        d.execute_script("const g=document.querySelector('dialog[open]'); if(g) g.close();")
        return saved
    finally:
        d.quit()


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    for width, height, name in VIEWPORTS:
        if ONLY and str(width) not in ONLY and name not in ONLY:
            continue
        print(f"\n=== {name} ({width}x{height}) ===")
        data = run(width, height, name)
        report[name] = data
        print(f"  hidratou: {data['hydrated']}  doc: {data['doc']}")
        print(f"  header: {data['header']}")
        if data["h1"]:
            h = data["h1"]
            print(f"  h1: {h['fontSize']}/{h['lineHeight']} ls={h['letterSpacing']} em {h['w']}x{h['h']}")
            for line in h["lines"]:
                print(f"    linha {line['w']:>6}px  '{line['text'][:40]}'")
        print(f"  hero: {data['hero']}")
        print(f"  portrait: {data['portrait']}")
        print(f"  orbits: {data['orbits']}")
        print(f"  gap entre seções: {data['sectionGap']}")
        print(f"  tags: {data['tagRows']}")
        if data["notice"]:
            print(f"  notice: {data['notice']}")
        if data["unrevealed"]:
            print(f"  NAO revelados: {len(data['unrevealed'])}")
            for item in data["unrevealed"][:6]:
                print(f"    - {item}")
        if data["overflowEls"]:
            print(f"  estouram: {data['overflowEls']}")
        print(f"  body bg: {data['bodyBg']}")
        print(f"  textos <12px: {len(data['smallText'])}")
        for item in data["smallText"][:8]:
            print(f"    - {item['fs']}px {item['lh']} ls={item['ls']} {item['color']} '{item['text'][:30]}'")
        (OUT / name / "metrics.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    for width, height, name in [(390, 844, "w390"), (320, 568, "w320")]:
        if ONLY and str(width) not in ONLY and name not in ONLY:
            continue
        print(f"\n=== slices {width}x{height} ===")
        saved = run_slices(width, height, name)
        print(f"  {saved}")
    print(f"\ncapturas em {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
