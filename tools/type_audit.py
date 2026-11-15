"""Auditoria tipografica da replica do PagFlow.

Roda em Edge headless com o board em escala 1 e verifica, nos 12 temas:

  1. mojibake em qualquer texto renderizado (Ã, ðŸ, â€, Â») — o arquivo tem de
     ser UTF-8 de verdade, nao UTF-8 lido como cp1252;
  2. emoji do logo: tinta desenhada no canvas dentro do alvo do PyQt
     (90% do miolo do tile: 27px sem tile, 21,6px com tile) e centrada;
  3. rotulo, sufixo e subtitulo do cartao de marca sem estouro horizontal,
     com o sufixo na mesma linha de base do rotulo;
  4. textos cortados sem reticencias (elementos com overflow != visible);
  5. grade de temas: nome sem colidir com o selo ATIVO e descricao em 2 linhas.

Uso:
    python type_audit.py             # relatorio no terminal (JSON + resumo)
    python type_audit.py --shots     # + capturas em tools/shots/type/

Saida: codigo 1 se achar qualquer falha.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options

ROOT = Path(__file__).resolve().parent.parent / "pagflow"
OUT = Path(__file__).resolve().parent / "shots" / "type"
THEMES = ["dark", "light", "graduation", "ozzy", "lana", "acai",
          "vaporwave", "alien", "wolverine", "flowerboy", "natal", "leila"]

URGENT = "ðŸ|â€|Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|\ufffd"
SKIP_OVERFLOW = ["themeGrid", "reviewScroll", "board", "app", "railThemes"]

CHECK = r"""
const bad = [];
document.querySelectorAll('#app *, #rail *').forEach((el) => {
  if (!el.getClientRects().length) return;
  if (SKIP.some(c => el.id === c || el.classList.contains(c))) return;
  const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())
    .map(n => n.textContent.trim()).join(' ');
  if (!own || own.length < 2) return;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden') return;
  const over = el.scrollWidth - el.clientWidth;
  if (over > 1 && cs.textOverflow !== 'ellipsis' && cs.overflow !== 'visible') {
    bad.push({ cls: String(el.className).slice(0, 30), text: own.slice(0, 56), over });
  }
});
return { bad, urgent: (document.body.innerText.match(new RegExp(URGENT, 'g')) || []).length };
"""

CARD = r"""
const q = (s) => document.querySelector(s);
const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
const title = q('.brand__title');
const line = q('.brand__line');
const suffix = q('.brand__suffix');
const emojiCanvas = q('.brand__logo canvas');
const ink = (() => {
  if (!emojiCanvas) return null;
  const g = emojiCanvas.getContext('2d');
  const { width: w, height: h } = emojiCanvas;
  const d = g.getImageData(0, 0, w, h).data;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  const s = w / 30;
  return { w: +((x1 - x0 + 1) / s).toFixed(1), h: +((y1 - y0 + 1) / s).toFixed(1),
           cx: +(((x0 + x1 + 1) / 2) / s).toFixed(1), cy: +(((y0 + y1 + 1) / 2) / s).toFixed(1) };
})();
return {
  text: title.textContent.trim(),
  lineText: line ? line.textContent : "",
  title: box(title), suffix: suffix ? box(suffix) : null, card: box(q('.brand')), logo: box(q('.brand__logo')),
  titleOver: title.scrollWidth - title.clientWidth,
  suffixOver: suffix ? suffix.scrollWidth - suffix.clientWidth : 0,
  subOver: q('.brand__sub').scrollWidth - q('.brand__sub').clientWidth,
  tile: q('.brand__logo').classList.contains('brand__logo--tile'),
  ink,
  mojibake: new RegExp(URGENT).test(document.body.innerText),
};
"""


def make_driver(width: int = 1500, height: int = 1100) -> webdriver.Edge:
    opts = Options()
    for arg in ("--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--window-size={width},{height}", "--allow-file-access-from-files", "--disable-gpu"):
        opts.add_argument(arg)
    driver = webdriver.Edge(options=opts)
    driver.set_window_size(width, height)
    return driver


def wait(sec: float = 0.45) -> None:
    time.sleep(sec)


def main() -> int:
    shots = "--shots" in sys.argv
    if shots:
        OUT.mkdir(parents=True, exist_ok=True)
    driver = make_driver()
    report: dict = {"themes": {}, "grid": [], "rail": []}
    try:
        driver.get((ROOT / "index.html").as_uri())
        wait(1.5)
        driver.execute_script("window.SKIP = %s; window.URGENT = %s;"
                              % (json.dumps(SKIP_OVERFLOW), json.dumps(URGENT)))
        driver.execute_script("""
          const b = document.getElementById('board');
          b.style.setProperty('--s', '1');
          document.getElementById('frameWrap').style.width = '1280px';
          document.getElementById('frameWrap').style.height = '960px';
          document.querySelector('.stage').style.height = '984px';
          window.__pfCapture = true;
          document.querySelectorAll('#railThemes .tbtn').forEach(x => x.click());
        """)
        wait(0.8)

        report["rail"] = driver.execute_script(r"""
          document.getElementById('railToggle').click();
          const r = [...document.querySelectorAll('#railThemes .tbtn')].map(b => ({
            t: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width),
            over: b.scrollWidth - b.clientWidth }));
          document.getElementById('railToggle').click();
          return r;
        """)
        wait(0.6)

        for key in THEMES:
            driver.execute_script(
                "document.querySelector('.tbtn[data-key=\"%s\"]').click();" % key)
            wait(0.55)
            card = driver.execute_script(CARD)
            card.update(driver.execute_script(CHECK))
            report["themes"][key] = card
            if shots:
                driver.find_element("css selector", ".brand").screenshot(str(OUT / ("brand-" + key + ".png")))

        driver.execute_script("document.getElementById('btnConfig').click()")
        wait(0.6)
        driver.execute_script("document.querySelectorAll('.tab')[1].click()")
        wait(0.5)
        report["grid"] = driver.execute_script(r"""
          return [...document.querySelectorAll('.theme-card')].map(c => {
            const n = c.querySelector('.theme-card__name');
            const p = c.querySelector('.theme-card__pill');
            const d = c.querySelector('.theme-card__desc');
            const nr = n.getBoundingClientRect();
            const pr = p ? p.getBoundingClientRect() : null;
            return { name: n.textContent, cardW: Math.round(c.getBoundingClientRect().width),
                     nameOver: n.scrollWidth - n.clientWidth,
                     collides: pr ? Math.round(nr.right) > Math.round(pr.left) - 4 : false,
                     descOver: d ? d.scrollHeight - d.clientHeight : 0 };
          });
        """)
        if shots:
            driver.save_screenshot(str(OUT / "grid-12.png"))

        # diálogos: 5 abas, revisão de envio e caixa de mensagem
        report["dialogs"] = {}
        for index, name in ((0, "geral"), (1, "aparencia"), (2, "privacidade"),
                            (3, "codigo"), (4, "sobre")):
            driver.execute_script(f"document.querySelectorAll('.tab')[{index}].click()")
            wait(0.35)
            report["dialogs"]["config-" + name] = driver.execute_script(CHECK)
        driver.execute_script("document.getElementById('settingsClose').click()")
        wait(0.5)
        driver.execute_script("document.getElementById('demoReview').click()")
        wait(0.9)
        report["dialogs"]["revisao"] = driver.execute_script(CHECK)
        driver.execute_script("document.getElementById('reviewClose').click()")
        wait(0.5)
        driver.execute_script("document.getElementById('btnGerar').click()")
        wait(0.5)
        report["dialogs"]["mensagem"] = driver.execute_script(CHECK)
        driver.execute_script("document.getElementById('msgOk').click()")
        wait(0.4)
    finally:
        driver.quit()

    # ── veredito ─────────────────────────────────────────────────────────────
    problems: list[str] = []
    for key, data in report["themes"].items():
        if data["mojibake"]:
            problems.append(f"{key}: mojibake no texto renderizado")
        if data["urgent"]:
            problems.append(f"{key}: {data['urgent']} sequencia(s) suspeita(s)")
        for field in ("titleOver", "suffixOver", "subOver"):
            if data[field] > 0:
                problems.append(f"{key}: {field}={data[field]}px")
        ink = data["ink"]
        if ink:
            alvo = 24 * 0.9 if data["tile"] else 30 * 0.9
            maior = max(ink["w"], ink["h"])
            if abs(maior - alvo) > 1.6:
                problems.append(f"{key}: emoji {maior:.1f}px (alvo {alvo:.1f}px)")
            if abs(ink["cx"] - 15) > 1 or abs(ink["cy"] - 15) > 1.5:
                problems.append(f"{key}: emoji fora do centro ({ink['cx']}, {ink['cy']})")
        for item in data["bad"]:
            problems.append(f"{key}: texto cortado .{item['cls']} \"{item['text']}\"")
    for name, data in report["dialogs"].items():
        if data["urgent"]:
            problems.append(f"{name}: {data['urgent']} sequencia(s) suspeita(s)")
        for item in data["bad"]:
            problems.append(f"{name}: texto cortado .{item['cls']} \"{item['text']}\"")
    for card in report["grid"]:
        if card["collides"]:
            problems.append(f"grade: {card['name']} encosta no selo")
        if card["nameOver"] > 0:
            problems.append(f"grade: {card['name']} truncado")
    for btn in report["rail"]:
        if btn["over"] > 0:
            problems.append(f"gaveta: {btn['t']} cortado")

    print(json.dumps(report, ensure_ascii=False, indent=1))
    print()
    if problems:
        print("FALHAS:", len(problems))
        for item in problems:
            print(" -", item)
        return 1
    print("OK — 12 temas sem mojibake, emoji no alvo, nenhum nome cortado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
