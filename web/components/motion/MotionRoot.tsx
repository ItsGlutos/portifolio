"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Camada cinematográfica, carregada sob demanda e só quando faz sentido:
 * - Lenis: rolagem suave (desligada em reduced motion e em telas de toque)
 * - GSAP ScrollTrigger: parallax de profundidade nos elementos [data-parallax]
 *
 * Os dois entram por import dinâmico: quem tem reduced motion não baixa nada.
 */
export function MotionRoot() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.06,
        smoothWheel: true,
        wheelMultiplier: 0.92,
        touchMultiplier: 1.4,
      });

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const parallax = gsap.utils
        .toArray<HTMLElement>("[data-parallax]")
        .map((element) => {
          const depth = Number(element.dataset.parallax ?? 0.08);
          return gsap.to(element, {
            yPercent: -depth * 100,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

      cleanup = () => {
        for (const tween of parallax) {
          tween.scrollTrigger?.kill();
          tween.kill();
        }
        gsap.ticker.remove(tick);
        lenis.off("scroll", onScroll);
        lenis.destroy();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
