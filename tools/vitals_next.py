"""Mede Core Web Vitals do export React (Selenium + CDP, sem throttling).

Uso (com `python tools/serve_out.py 4300` rodando):
    python tools/vitals_next.py

Coleta LCP, CLS, FCP, TBT (long tasks), peso transferido por tipo e o
elemento de LCP. Serve como linha de base reproduzível; para Lighthouse
completo, rode `npx lighthouse` sobre o mesmo endereço.
"""
from __future__ import annotations

import json
import time

from selenium import webdriver
from selenium.webdriver.edge.options import Options

BASE = "http://127.0.0.1:4300/"

INIT = """
window.__vitals = { lcp: 0, lcpEl: '', cls: 0, fcp: 0, tbt: 0, longTasks: 0, shifts: [] };
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    window.__vitals.lcp = entry.startTime;
    window.__vitals.lcpEl = entry.element ? (entry.element.tagName + '.' + (entry.element.className || '')).slice(0, 80) : '';
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      window.__vitals.cls += entry.value;
      window.__vitals.shifts.push({ value: entry.value, time: entry.startTime });
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') window.__vitals.fcp = entry.startTime;
  }
}).observe({ type: 'paint', buffered: true });
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    window.__vitals.longTasks += 1;
    window.__vitals.tbt += Math.max(0, entry.duration - 50);
  }
}).observe({ type: 'longtask', buffered: true });
"""


def run(width: int, height: int, label: str) -> dict:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1600,1200")
    d = webdriver.Edge(options=options)
    try:
        d.execute_cdp_cmd(
            "Emulation.setDeviceMetricsOverride",
            {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700},
        )
        d.execute_cdp_cmd(
            "Emulation.setEmulatedMedia",
            {"features": [{"name": "prefers-reduced-motion", "value": "no-preference"}]},
        )
        d.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": INIT})
        d.get(BASE)
        time.sleep(3)
        # rola a página inteira para exercitar o caminho completo
        d.execute_script(
            "for (let y = 0; y < document.body.scrollHeight; y += 600) window.scrollTo(0, y); window.scrollTo(0,0);"
        )
        time.sleep(2.5)
        vitals = d.execute_script("return window.__vitals")
        resources = d.execute_script(
            """
            const by = {};
            for (const r of performance.getEntriesByType('resource')) {
              const type = r.initiatorType === 'link' || r.name.match(/\\.(woff2|css|js|svg|png|jpg)$/)?.[1] || r.initiatorType;
              by[type] = (by[type] || 0) + (r.transferSize || r.encodedBodySize || 0);
            }
            const nav = performance.getEntriesByType('navigation')[0];
            return { by, total: Object.values(by).reduce((a, b) => a + b, 0), ttfb: nav ? nav.responseStart : 0 };
            """
        )
    finally:
        d.quit()

    print(f"\n[{label} {width}x{height}]")
    print(f"  FCP   {vitals['fcp']:.0f} ms")
    print(f"  LCP   {vitals['lcp']:.0f} ms  ({vitals['lcpEl']})")
    print(f"  CLS   {vitals['cls']:.4f}")
    print(f"  TBT   {vitals['tbt']:.0f} ms em {vitals['longTasks']} tarefas longas")
    print(f"  TTFB  {resources['ttfb']:.0f} ms")
    for key, value in sorted(resources["by"].items(), key=lambda item: -item[1]):
        print(f"  {key:10} {value / 1024:8.1f} KB")
    print(f"  total     {resources['total'] / 1024:8.1f} KB")
    return {"vitals": vitals, "resources": resources}


def main() -> int:
    results = {}
    results["desktop"] = run(1440, 900, "desktop")
    results["mobile"] = run(390, 844, "mobile")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
