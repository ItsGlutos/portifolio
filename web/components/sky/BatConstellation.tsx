"use client";

import type { CSSProperties } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";
import {
  BAT_EDGES,
  BAT_POINTS,
  BAT_SIZES,
  BAT_VIEWBOX,
} from "@/lib/batConstellation";

import "./BatConstellation.css";

type BatConstellationProps = {
  className?: string;
};

/**
 * Morcego desenhado como constelação.
 *
 * - SVG puro, sem canvas: escala junto com a coluna e não pesa no scroll;
 * - entra quando aparece na tela (traços sendo desenhados, estrelas acendendo);
 * - parado, cintila e um pulso percorre alguns traços;
 * - `prefers-reduced-motion` mostra tudo parado, já aceso.
 */
export function BatConstellation({ className }: BatConstellationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -4% 0px",
  });

  const lineId = `bc-line-${uid}`;
  const haloId = `bc-halo-${uid}`;
  const flareId = `bc-flare-${uid}`;
  const flareFillId = `bc-flare-fill-${uid}`;

  const vars = {
    "--bc-line": `url(#${lineId})`,
    "--bc-halo": `url(#${haloId})`,
  } as CSSProperties;

  return (
    <div ref={ref} className={cn("bc", inView && "is-live", className)} aria-hidden="true">
      <span className="bc__aura" />

      <svg
        className="bc__svg"
        viewBox={BAT_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        style={vars}
        focusable="false"
      >
        <defs>
          <linearGradient
            id={lineId}
            gradientUnits="userSpaceOnUse"
            x1="-40"
            y1="0"
            x2="1240"
            y2="0"
          >
            <stop offset="0" stopColor="#4d9bd6" />
            <stop offset="0.14" stopColor="#7fcbff" />
            <stop offset="0.5" stopColor="#a7e3ff" />
            <stop offset="0.86" stopColor="#7fcbff" />
            <stop offset="1" stopColor="#4d9bd6" />
          </linearGradient>

          <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#d6f3ff" stopOpacity="0.58" />
            <stop offset="0.18" stopColor="#8fe0ff" stopOpacity="0.3" />
            <stop offset="0.46" stopColor="#55ceff" stopOpacity="0.09" />
            <stop offset="1" stopColor="#55ceff" stopOpacity="0" />
          </radialGradient>

          {/* Flare de quatro pontas: a mesma estrela em todos os nós. */}
          <radialGradient id={flareFillId} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.38" stopColor="#e3f8ff" stopOpacity="0.95" />
            <stop offset="0.78" stopColor="#a9e7ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8fe0ff" stopOpacity="0" />
          </radialGradient>
          <path
            id={flareId}
            d="M0 -10 L2.1 -2.1 L10 0 L2.1 2.1 L0 10 L-2.1 2.1 L-10 0 L-2.1 -2.1 Z"
          />
        </defs>

        <g className="bc__wires">
          {BAT_EDGES.map((edge) => (
            <line
              key={`glow-${edge.id}`}
              className="bc__wire bc__wire--glow"
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              pathLength={1}
              style={
                {
                  "--i": `${edge.delay}ms`,
                  "--w-op": 0.18,
                } as CSSProperties
              }
            />
          ))}
          {BAT_EDGES.map((edge) => (
            <line
              key={`line-${edge.id}`}
              className={cn("bc__wire", edge.weight === "vein" && "bc__wire--vein")}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              pathLength={1}
              style={
                {
                  "--i": `${edge.delay + 90}ms`,
                  "--w-op": edge.weight === "vein" ? 0.4 : 0.66,
                } as CSSProperties
              }
            />
          ))}
        </g>

        <g className="bc__pulses">
          {BAT_EDGES.filter((edge) => edge.pulse !== undefined).map((edge) => (
            <line
              key={`pulse-${edge.id}`}
              className="bc__pulse"
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              pathLength={1}
              style={{ "--pd": `${edge.pulse}s` } as CSSProperties}
            />
          ))}
        </g>

        <g className="bc__stars">
          {BAT_POINTS.map((point) => {
            const size = BAT_SIZES[point.kind];
            return (
              <g
                key={point.id}
                className={cn("bc__node", `bc__node--${point.kind}`)}
                style={
                  {
                    "--i": `${point.delay}ms`,
                    "--tw": `${point.twinkle}s`,
                    "--twd": `${point.twinkleOffset}s`,
                  } as CSSProperties
                }
              >
                <circle
                  className="bc__node-halo"
                  cx={point.x}
                  cy={point.y}
                  r={size.halo}
                />
                <circle
                  className="bc__node-core"
                  cx={point.x}
                  cy={point.y}
                  r={size.core}
                />
                <use
                  className="bc__node-flare"
                  href={`#${flareId}`}
                  transform={`translate(${point.x} ${point.y}) scale(${size.flare})`}
                  fill={`url(#${flareFillId})`}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
