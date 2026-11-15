"use client";

import { useEffect, useRef } from "react";
import { createSky } from "@/lib/starfield";

export function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sky = createSky(canvas);
    sky.resize();
    sky.start();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => sky.resize(), 150);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      sky.pointer(event.clientX, event.clientY);
    };
    const onPointerOut = () => sky.pointerOut();
    const onVisibility = () => {
      if (document.hidden) sky.stop();
      else sky.start();
    };
    const onPageHide = () => sky.stop();

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerOut);
    window.addEventListener("blur", onPointerOut);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerOut);
      window.removeEventListener("blur", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      sky.destroy();
    };
  }, []);

  return <canvas id="sky" aria-hidden="true" ref={canvasRef} />;
}
