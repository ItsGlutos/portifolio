"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Tilt + brilho do retrato: inclinação de 7°/9° e a posição da luz
 * acompanhando o ponteiro pelas variáveis --gx/--gy.
 */
export function PortraitTilt({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const wrapper = wrapperRef.current;
    const portrait = wrapper?.querySelector<HTMLElement>(".portrait");
    if (!wrapper || !portrait || reduced || event.pointerType === "touch") return;

    const rect = portrait.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    portrait.style.transform = `rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg)`;
    portrait.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    portrait.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
  }

  function handleLeave() {
    const portrait = wrapperRef.current?.querySelector<HTMLElement>(".portrait");
    if (portrait) {
      portrait.style.transform = "";
      portrait.style.removeProperty("--gx");
      portrait.style.removeProperty("--gy");
    }
  }

  return (
    <div
      className="hero__tilt"
      data-tilt=""
      ref={wrapperRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  );
}
