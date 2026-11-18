"use client";

import { useEffect } from "react";

/**
 * Revelação no scroll.
 *
 * O HTML estático chega visível e a entrada da primeira tela é feita em CSS
 * (`@starting-style`), então nada fica esperando a hidratação — nem a animação,
 * nem o conteúdo. O JS só esconde o que está fora da dobra (`.is-pending`) e
 * devolve quando o elemento entra na tela, com transição.
 *
 * Conteúdo montado depois (filtro de projetos) nasce escondido e entra animado;
 * a classe é escrita no DOM, não controlada pelo React, para re-render não
 * apagar o estado da revelação.
 */

/** Acima desta fração da tela o bloco ainda é considerado "fora da dobra". */
const HIDE_AFTER_VIEWPORT = 0.92;

/** Evento disparado por quem troca conteúdo na tela (filtro, rotas). */
export const REVEAL_REFRESH_EVENT = "reveal:refresh";

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

    if (media.matches || !supportsIO) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    /* Esconde só o que está abaixo da primeira tela: o que já está visível
       acabou de animar pela `@starting-style`. */
    const hideBelowFold = () => {
      const limit = window.innerHeight * HIDE_AFTER_VIEWPORT;
      for (const element of targets()) {
        if (element.classList.contains("is-visible")) continue;
        if (element.getBoundingClientRect().top > limit) {
          element.classList.add("is-pending");
          observer.observe(element);
        }
      }
    };

    hideBelowFold();

    /* Depois de uma troca de conteúdo (filtro), o que passou a estar na tela
       entra agora — o IntersectionObserver não reavalia durante a transição. */
    const refresh = () => {
      const height = window.innerHeight;
      for (const element of targets()) {
        if (element.classList.contains("is-visible")) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top < height && rect.bottom > 0) reveal(element);
      }
    };

    /* Conteúdo novo: nasce escondido e entra animado (ou fica esperando a
       rolagem, se estiver fora da tela). */
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const added = node.matches("[data-reveal]")
            ? [node]
            : Array.from(node.querySelectorAll<HTMLElement>("[data-reveal]"));

          for (const element of added) {
            element.classList.add("is-pending");
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              window.requestAnimationFrame(() => reveal(element));
            } else {
              observer.observe(element);
            }
          }
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    /* Rede de segurança: se o observer não disparar (aba em segundo plano),
       o que já está na tela aparece. */
    const safety = window.setTimeout(refresh, 2200);

    const onMotionChange = () => {
      if (media.matches) revealAll();
    };

    document.addEventListener(REVEAL_REFRESH_EVENT, refresh);
    media.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearTimeout(safety);
      document.removeEventListener(REVEAL_REFRESH_EVENT, refresh);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return null;
}
