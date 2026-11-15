"use client";

import { useEffect } from "react";

/**
 * Proxy de revelação no scroll.
 *
 * O site original escondia `[data-reveal]` via `.js` e revelava com
 * IntersectionObserver. Aqui o wrapper não interfere no layout (nada de div
 * extra entre grid items): ele observa os nós marcados com `data-reveal`.
 *
 * Dois detalhes que o site estático não tinha:
 * 1. nós inseridos depois (filtro de projetos) são revelados por
 *    MutationObserver — sem isso eles nasceriam invisíveis;
 * 2. com `prefers-reduced-motion: reduce` tudo é revelado na hora, inclusive
 *    conteúdo novo. O observer de mutação continua ativo mesmo nesse modo.
 */
export function RevealRoot() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsIO = "IntersectionObserver" in window;

    const reveal = (element: HTMLElement) => element.classList.add("is-visible");
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => reveal(element));
    };

    let observer: IntersectionObserver | undefined;

    if (media.matches || !supportsIO) {
      revealAll();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            reveal(entry.target as HTMLElement);
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => observer?.observe(element));
    }

    /* Conteúdo montado depois (filtro, rotas): revela, sempre. */
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const targets = node.matches("[data-reveal]")
            ? [node]
            : Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]"));

          for (const target of targets) {
            if (media.matches) {
              reveal(target);
            } else {
              window.requestAnimationFrame(() => reveal(target));
            }
          }
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    const onMotionChange = () => {
      if (media.matches) revealAll();
    };
    media.addEventListener("change", onMotionChange);

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return null;
}
