"use client";

import { useEffect } from "react";

/**
 * Revelação no scroll.
 *
 * O HTML estático chega **visível**: nada de `opacity: 0` esperando a
 * hidratação. Numa rede móvel lenta o JS pode levar dezenas de segundos, e a
 * versão anterior entregava, nesse intervalo, um título solto num vazio.
 *
 * Agora só o que está fora da primeira tela é escondido — e isso é aplicado no
 * mount (`.is-pending`), quando o bloco abaixo da dobra não pode ser visto
 * mesmo. Quem já está na tela nasce revelado.
 *
 * Dois detalhes que o site estático não tinha:
 * 1. nós inseridos depois (filtro de projetos) são revelados por
 *    MutationObserver — sem isso eles nasceriam invisíveis;
 * 2. com `prefers-reduced-motion: reduce` nada é escondido.
 */

/** Acima desta fração da tela o bloco já entra visível. */
const HIDE_AFTER_VIEWPORT = 0.92;

export function RevealRoot() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsIO = "IntersectionObserver" in window;

    const targets = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const reveal = (element: HTMLElement) => {
      element.classList.remove("is-pending");
      element.classList.add("is-visible");
    };
    const revealAll = () => targets().forEach(reveal);

    let observer: IntersectionObserver | undefined;
    let safety = 0;

    if (media.matches || !supportsIO) {
      revealAll();
    } else {
      const limit = window.innerHeight * HIDE_AFTER_VIEWPORT;

      for (const element of targets()) {
        if (element.getBoundingClientRect().top > limit) {
          element.classList.add("is-pending");
        } else {
          element.classList.add("is-visible");
        }
      }

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

      targets()
        .filter((element) => element.classList.contains("is-pending"))
        .forEach((element) => observer?.observe(element));

      /* Rede de segurança: se o observer não disparar (aba em segundo plano,
         IO interrompido), o que já está na tela aparece. */
      safety = window.setTimeout(() => {
        const height = window.innerHeight;
        for (const element of targets()) {
          if (!element.classList.contains("is-pending")) continue;
          const rect = element.getBoundingClientRect();
          if (rect.top < height && rect.bottom > 0) reveal(element);
        }
      }, 2200);
    }

    /* Conteúdo montado depois (filtro, rotas): revela, sempre. */
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const added = node.matches("[data-reveal]")
            ? [node]
            : Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]"));

          for (const target of added) {
            window.requestAnimationFrame(() => reveal(target));
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
      window.clearTimeout(safety);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return null;
}
