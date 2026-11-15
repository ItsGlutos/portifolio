"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

type Options = {
  threshold?: number;
  rootMargin?: string;
  /** Já nasce visível: usado em cartões remontados pela troca de filtro. */
  initial?: boolean;
};

/**
 * Revelação por interseção, com estado no React.
 *
 * Diferente de manipular `is-visible` por classe no DOM: o estado sobrevive a
 * re-renders e remontagens (filtro de projetos), então um cartão nunca fica
 * invisível por ter perdido a classe.
 */
export function useInView<T extends HTMLElement>(options?: Options) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(options?.initial ?? false);

  const threshold = options?.threshold ?? 0.12;
  const rootMargin = options?.rootMargin ?? "0px 0px -6% 0px";

  useEffect(() => {
    if (reduced) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced, threshold, rootMargin]);

  return { ref, inView };
}
