/**
 * Constelação do morcego — geometria pura.
 *
 * O desenho parte da referência (asas abertas, orelhas e cauda) e é
 * reconstruído como grafo: cada estrela é um vértice, cada traço é uma aresta
 * reta. Metade esquerda é declarada uma vez e espelhada — assim a figura fica
 * simétrica e o ajuste fino acontece em um lugar só.
 *
 * Unidades: viewBox de 1280 × 470, centro em x = 600. Nada aqui depende de
 * DOM: o componente só escolhe tamanhos e anima.
 */

export type BatPointKind = "major" | "mid" | "minor";

export type BatPoint = {
  id: string;
  x: number;
  y: number;
  kind: BatPointKind;
  /** atraso da entrada, em ms (do centro para fora) */
  delay: number;
  /** duração do cintilar, em s */
  twinkle: number;
  /** defasagem do cintilar, em s (negativa, para não pulsarem juntos) */
  twinkleOffset: number;
};

export type BatEdge = {
  id: string;
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight: "bone" | "vein";
  /** atraso do pulso que percorre o traço, em s */
  pulse?: number;
  /** atraso do traço sendo desenhado, em ms */
  delay: number;
};

export type BatSize = { core: number; halo: number; flare: number };

export const BAT_VIEWBOX = "-40 -30 1280 470";
export const BAT_CENTER = { x: 600, y: 262 };

export const BAT_SIZES: Record<BatPointKind, BatSize> = {
  major: { core: 3.2, halo: 34, flare: 1.45 },
  mid: { core: 2, halo: 21, flare: 0.9 },
  minor: { core: 1.1, halo: 12, flare: 0.6 },
};

type PointSeed = { id: string; x: number; y: number; kind: BatPointKind };
type EdgeSeed = {
  from: string;
  to: string;
  weight: BatEdge["weight"];
  pulse?: number;
};

/* Metade esquerda, medida a partir da referência. */
const LEFT_POINTS: PointSeed[] = [
  { id: "tip", x: 16, y: 141, kind: "major" }, // ponta da asa
  { id: "upper", x: 125, y: 92, kind: "mid" }, // quebra da borda superior
  { id: "peak", x: 311, y: 26, kind: "major" }, // alto da asa
  { id: "shoulder", x: 215, y: 205, kind: "major" }, // ombro
  { id: "wrist", x: 428, y: 134, kind: "major" }, // pulso: onde a membrana dobra
  { id: "low", x: 257, y: 280, kind: "major" }, // baixo do ombro
  { id: "lowMid", x: 424, y: 287, kind: "major" }, // base da asa
  { id: "bottomOuter", x: 480, y: 329, kind: "mid" }, // vinco antes da cauda
  { id: "inner", x: 532, y: 170, kind: "mid" }, // encontro da asa com o corpo
  { id: "earTip", x: 518, y: 68, kind: "major" }, // ponta da orelha
  { id: "earIn", x: 565, y: 124, kind: "mid" }, // base interna da orelha
  { id: "vein", x: 347, y: 165, kind: "minor" }, // estrela solta no meio da asa
];

const CENTER_POINTS: PointSeed[] = [
  { id: "chest", x: 600, y: 262, kind: "mid" },
  { id: "tail", x: 600, y: 400, kind: "major" },
];

/* Arestas da metade esquerda. As que tocam o centro são ligadas depois. */
const LEFT_EDGES: EdgeSeed[] = [
  { from: "tip", to: "upper", weight: "bone", pulse: 0 },
  { from: "upper", to: "peak", weight: "bone", pulse: 0.27 },
  { from: "peak", to: "wrist", weight: "bone" },
  { from: "peak", to: "shoulder", weight: "bone" },
  { from: "tip", to: "shoulder", weight: "bone" },
  { from: "shoulder", to: "vein", weight: "vein" },
  { from: "vein", to: "wrist", weight: "vein" },
  { from: "shoulder", to: "low", weight: "bone" },
  { from: "low", to: "lowMid", weight: "bone" },
  { from: "lowMid", to: "wrist", weight: "bone" },
  { from: "lowMid", to: "bottomOuter", weight: "bone", pulse: 1.15 },
  { from: "bottomOuter", to: "tail", weight: "bone", pulse: 1.42 },
  { from: "wrist", to: "inner", weight: "vein" },
  { from: "inner", to: "chest", weight: "vein" },
  { from: "inner", to: "earTip", weight: "bone" },
  { from: "earTip", to: "earIn", weight: "bone", pulse: 2.2 },
];

/* Arestas do eixo central (sem espelho). */
const CENTER_EDGES: EdgeSeed[] = [
  { from: "earIn", to: "earInR", weight: "bone", pulse: 2.48 },
  { from: "chest", to: "tail", weight: "bone", pulse: 1.9 },
];

const CENTER_IDS = new Set(CENTER_POINTS.map((point) => point.id));

function mirrorId(id: string): string {
  return CENTER_IDS.has(id) ? id : `${id}R`;
}

/** FNV-1a: valores estáveis entre servidor e cliente (nada de Math.random). */
function hash01(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function distanceFromCenter(x: number, y: number): number {
  return Math.hypot(x - BAT_CENTER.x, y - BAT_CENTER.y);
}

const ALL_POINT_SEEDS: PointSeed[] = [
  ...LEFT_POINTS,
  ...LEFT_POINTS.map((point) => ({
    ...point,
    id: mirrorId(point.id),
    x: 2 * BAT_CENTER.x - point.x,
  })),
  ...CENTER_POINTS,
];

export const BAT_POINTS: BatPoint[] = ALL_POINT_SEEDS.map((point) => {
  const distance = distanceFromCenter(point.x, point.y);
  const seed = hash01(point.id);
  return {
    ...point,
    /* Da cauda para fora: o desenho cresce a partir do corpo. */
    delay: Math.round(90 + distance * 0.62 + (point.kind === "minor" ? 110 : 0)),
    twinkle: 4.4 + seed * 3.4,
    twinkleOffset: -(seed * 9 + 1.5),
  };
});

const POINT_BY_ID = new Map(BAT_POINTS.map((point) => [point.id, point]));

const EDGE_SEEDS: EdgeSeed[] = [
  ...LEFT_EDGES,
  ...LEFT_EDGES.map((edge) => ({
    ...edge,
    from: mirrorId(edge.from),
    to: mirrorId(edge.to),
  })),
  ...CENTER_EDGES,
];

export const BAT_EDGES: BatEdge[] = EDGE_SEEDS.map((edge) => {
  const from = POINT_BY_ID.get(edge.from);
  const to = POINT_BY_ID.get(edge.to);

  if (!from || !to) {
    throw new Error(`Aresta ${edge.from}-${edge.to} aponta para estrela inexistente.`);
  }

  const midDistance = distanceFromCenter((from.x + to.x) / 2, (from.y + to.y) / 2);

  return {
    id: `${edge.from}-${edge.to}`,
    from: edge.from,
    to: edge.to,
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    weight: edge.weight,
    pulse: edge.pulse,
    delay: Math.round(300 + midDistance * 0.62 + (edge.weight === "vein" ? 130 : 0)),
  };
});

/** Contagens usadas na legenda da demo (não é decoração do site). */
export const BAT_STATS = {
  stars: BAT_POINTS.length,
  lines: BAT_EDGES.length,
};
