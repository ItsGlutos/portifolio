/**
 * Céu estrelado em Canvas 2D — port fiel de `assets/js/stars.js`.
 * Lógica pura, sem React: o componente só liga ao ciclo de vida.
 *
 * - semente determinística (20261104): o céu é sempre o mesmo lugar
 * - 25 fps, pausa com a aba oculta
 * - constelação de proximidade: o ponteiro vira uma estrela a mais
 */

const SEED = 20261104;
const PALETTE = ["#6FA8F0", "#8FC2FF", "#5B8FC9", "#A9CCFF", "#4E7FB8"] as const;
const SPARKLE_PALETTE = ["#A9CCFF", "#C7DEFF", "#8FC2FF", "#D8E9FF"] as const;
const HALO_COLOR = "156,199,255";
const REACH = 168;

/* Frequência da estrela cadente. O céu não pode contar com ela: a primeira
   passa depois que a pessoa já se instalou, as seguintes ficam quase um
   minuto em silêncio, e às vezes vem uma segunda logo atrás — como no céu
   de verdade. Ajuste aqui se quiser mais ou menos raridade. */
const METEOR_FIRST: readonly [number, number] = [8, 13];
const METEOR_GAP: readonly [number, number] = [34, 76];
const METEOR_PAIR_GAP: readonly [number, number] = [2.6, 5.6];
const METEOR_PAIR_CHANCE = 0.18;

function between(range: readonly [number, number]): number {
  return range[0] + Math.random() * (range[1] - range[0]);
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
  ph: number;
  slow: number;
  slowPh: number;
  rest: number;
  floor: number;
  gain: number;
  seed: number;
  color: string;
  sparkle: boolean;
  halo: boolean;
  spin: number;
  rot0: number;
}

/** Estrela cadente: um dos nossos ✦ desgarrado do céu, com rastro. */
interface Meteor {
  born: number;
  life: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: number;
  size: number;
}

export interface Sky {
  start(): void;
  stop(): void;
  resize(): void;
  pointer(x: number, y: number): void;
  pointerOut(): void;
  destroy(): void;
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hash01(value: number): number {
  let n = value;
  n = (n ^ 61) ^ (n >>> 16);
  n = Math.imul(n, 9);
  n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d);
  n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
}

function noise1(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const offset = Math.imul(seed, 668265263);
  const a = hash01(Math.imul(i, 374761393) + offset);
  const b = hash01(Math.imul(i + 1, 374761393) + offset);
  return a + (b - a) * u;
}

function fbm(x: number, seed: number): number {
  return 0.64 * noise1(x, seed) + 0.36 * noise1(x * 2.31 + 7.7, seed + 19);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep01(value: number): number {
  return value * value * (3 - 2 * value);
}

function pick<T>(list: readonly T[], random: () => number): T {
  const index = (random() * list.length) | 0;
  return list[index] ?? list[0]!;
}

function seedStars(count: number, haloCount: number, random: () => number): Star[] {
  const result: Star[] = [];
  const dustCount = count - haloCount;
  const sparkleCount = Math.max(2, Math.round(dustCount * 0.1));

  for (let i = 0; i < dustCount; i += 1) {
    if (i < sparkleCount) {
      result.push({
        x: 0.02 + random() * 0.96,
        y: 0.015 + random() * 0.97,
        r: 4.8 + random() * 2.0,
        a: 200 + random() * 55,
        p: 3.8 + random() * 4.0,
        ph: random() * 100,
        slow: 9 + random() * 9,
        slowPh: random() * 100,
        rest: 0,
        floor: 0.02 + random() * 0.06,
        gain: 1.55 + random() * 0.2,
        spin: (0.06 + random() * 0.06) * (random() < 0.5 ? -1 : 1),
        rot0: random() * Math.PI * 2,
        seed: (random() * 999999) | 0,
        color: pick(SPARKLE_PALETTE, random),
        sparkle: true,
        halo: false,
      });
      continue;
    }

    const tone = random();
    let rest: number;
    let floor: number;
    let alpha: number;
    let gain: number;

    if (tone < 0.18) {
      rest = 0.38 + random() * 0.25;
      floor = 0.22 + random() * 0.16;
      alpha = 70 + random() * 80;
      gain = 1.4;
    } else if (tone < 0.56) {
      rest = 0.03 + random() * 0.12;
      floor = 0.08 + random() * 0.14;
      alpha = 125 + random() * 90;
      gain = 1.45;
    } else {
      rest = 0;
      floor = 0.01 + random() * 0.07;
      alpha = 160 + random() * 85;
      gain = 1.55;
    }

    result.push({
      x: 0.015 + random() * 0.97,
      y: 0.01 + random() * 0.98,
      r: 0.8 + random() * 0.9,
      a: alpha,
      p: 3.4 + random() * 4.4,
      ph: random() * 100,
      slow: 7.5 + random() * 10.5,
      slowPh: random() * 100,
      rest,
      floor,
      gain,
      seed: (random() * 999999) | 0,
      color: pick(PALETTE, random),
      sparkle: false,
      halo: false,
      spin: 0,
      rot0: 0,
    });
  }

  for (let i = 0; i < haloCount; i += 1) {
    const tone = random();
    result.push({
      x: 0.1 + random() * 0.8,
      y: 0.07 + random() * 0.85,
      r: 1.5 + random() * 0.5,
      a: 190 + random() * 55,
      p: 5.5 + random() * 4.5,
      ph: random() * 100,
      slow: 12 + random() * 10,
      slowPh: random() * 100,
      rest: tone < 0.25 ? 0 : 0.14 + random() * 0.24,
      floor: 0.14 + random() * 0.12,
      gain: 1.4,
      seed: (random() * 999999) | 0,
      color: HALO_COLOR,
      sparkle: false,
      halo: true,
      spin: 0,
      rot0: 0,
    });
  }

  return result;
}

function starLevel(star: Star, time: number): number {
  const fast = smoothstep01(fbm(time / star.p + star.ph, star.seed));
  const slow = fbm(time / star.slow + star.slowPh, star.seed + 37);
  const gate = smoothstep01(clamp01((slow - 0.28) / 0.48));
  const presence = star.rest + (1 - star.rest) * gate;
  const pulse = star.floor + (1 - star.floor) * fast;
  return Math.min(1, pulse * presence * star.gain);
}

export function createSky(canvas: HTMLCanvasElement): Sky {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      start() {},
      stop() {},
      resize() {},
      pointer() {},
      pointerOut() {},
      destroy() {},
    };
  }

  let stars: Star[] = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let lastFrame = 0;
  let startedAt = 0;
  let elapsed = 0;
  let running = false;
  const pointer = { x: 0, y: 0, active: false };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let meteors: Meteor[] = [];
  let nextMeteorAt = 0;
  let pairAt = 0;

  function regenerate() {
    const area = width * height;
    const count = Math.max(24, Math.min(140, Math.round(area / 4500)));
    const haloCount = Math.max(3, Math.round(count / 12));
    stars = seedStars(count, haloCount, createRandom(SEED));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    regenerate();
    /* Um resize não reinicia a espera: no mobile a barra de endereço muda a
       altura várias vezes e a cadente nunca chegaria. Só limpa as que estão
       voando, porque as coordenadas antigas deixaram de valer. */
    meteors = [];
    pairAt = 0;
  }

  function drawSparkle(
    x: number,
    y: number,
    radius: number,
    angle: number,
    alpha: number,
    color: string,
  ) {
    const glowRadius = radius * 2.6;
    const glow = ctx!.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, `rgba(${HALO_COLOR},${(alpha / 255) * 0.16})`);
    glow.addColorStop(1, `rgba(${HALO_COLOR},0)`);

    ctx!.save();
    ctx!.translate(x, y);
    ctx!.rotate(angle);
    ctx!.globalAlpha = 1;
    ctx!.fillStyle = glow;
    ctx!.beginPath();
    ctx!.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx!.fill();

    const waist = radius * 0.14;
    ctx!.globalAlpha = alpha / 255;
    ctx!.fillStyle = color;
    ctx!.beginPath();
    for (let k = 0; k < 8; k += 1) {
      const pointAngle = -Math.PI / 2 + (k * Math.PI) / 4;
      const length = k % 2 === 0 ? radius : waist;
      const px = Math.cos(pointAngle) * length;
      const py = Math.sin(pointAngle) * length;
      if (k === 0) ctx!.moveTo(px, py);
      else ctx!.lineTo(px, py);
    }
    ctx!.closePath();
    ctx!.fill();
    ctx!.restore();
  }

  function spawnMeteor(time: number) {
    if (reducedMotion.matches || meteors.length >= 2 || width < 240) return;

    const min = Math.min(width, height);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const angle = (17 + Math.random() * 21) * (Math.PI / 180);
    const life = 0.55 + Math.random() * 0.32;
    const travel = min * (0.55 + Math.random() * 0.38);
    const speed = travel / life;
    const vx = Math.cos(angle) * speed * dir;
    const vy = Math.sin(angle) * speed;
    const startX =
      dir === 1
        ? -0.06 * width + Math.random() * 0.5 * width
        : width * 0.5 + Math.random() * 0.56 * width;
    const startY = height * (0.03 + Math.random() * 0.27);

    meteors.push({
      born: time,
      life,
      x: startX,
      y: startY,
      vx,
      vy,
      trail: min * (0.2 + Math.random() * 0.12),
      size: 2.6 + Math.min(1.1, min / 1600),
    });
  }

  /** Agenda as passagens em segundos do relógio do céu (pausa junto com ele). */
  function scheduleMeteors(time: number) {
    if (nextMeteorAt === 0) nextMeteorAt = time + between(METEOR_FIRST);

    if (pairAt > 0 && time >= pairAt) {
      spawnMeteor(time);
      pairAt = 0;
    }

    if (time < nextMeteorAt) return;

    spawnMeteor(time);
    nextMeteorAt = time + between(METEOR_GAP);
    pairAt = Math.random() < METEOR_PAIR_CHANCE ? time + between(METEOR_PAIR_GAP) : 0;
  }

  function drawMeteors(time: number) {
    for (let i = meteors.length - 1; i >= 0; i -= 1) {
      const meteor = meteors[i]!;
      const progress = (time - meteor.born) / meteor.life;
      if (progress >= 1) {
        meteors.splice(i, 1);
        continue;
      }
      if (progress < 0) continue;

      const headX = meteor.x + meteor.vx * (time - meteor.born);
      const headY = meteor.y + meteor.vy * (time - meteor.born);
      const fadeIn = Math.min(1, progress / 0.14);
      const fadeOut = 1 - Math.max(0, (progress - 0.62) / 0.38);
      const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      if (opacity <= 0.01) continue;

      const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
      const ux = meteor.vx / speed;
      const uy = meteor.vy / speed;
      const grown = 0.35 + 0.65 * Math.min(1, progress / 0.22);
      const length = meteor.trail * grown;
      const tailX = headX - ux * length;
      const tailY = headY - uy * length;

      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";

      /* Halo do rastro: ciano largo, some na cauda. */
      const glow = ctx!.createLinearGradient(tailX, tailY, headX, headY);
      glow.addColorStop(0, "rgba(85, 206, 255, 0)");
      glow.addColorStop(0.6, `rgba(85, 206, 255, ${(0.2 * opacity).toFixed(3)})`);
      glow.addColorStop(1, `rgba(190, 240, 255, ${(0.55 * opacity).toFixed(3)})`);
      ctx!.strokeStyle = glow;
      ctx!.lineWidth = 7;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(tailX, tailY);
      ctx!.lineTo(headX, headY);
      ctx!.stroke();

      /* Núcleo afilado: fino na cauda, branco na cabeça. */
      const steps = 18;
      for (let s = 0; s < steps; s += 1) {
        const t0 = s / steps;
        const t1 = (s + 1) / steps;
        const headward = 1 - (t0 + t1) / 2;
        const alpha = opacity * headward ** 1.35;
        if (alpha <= 0.004) continue;
        const red = 85 + (232 - 85) * headward;
        const green = 206 + (248 - 206) * headward;
        ctx!.strokeStyle = `rgba(${red.toFixed(0)}, ${green.toFixed(0)}, 255, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = 0.45 + 1.55 * headward;
        ctx!.beginPath();
        ctx!.moveTo(headX - ux * length * t0, headY - uy * length * t0);
        ctx!.lineTo(headX - ux * length * t1, headY - uy * length * t1);
        ctx!.stroke();
      }

      /* Cabeça: o mesmo ✦ do céu, com um bloom curto. */
      const bloomRadius = 20;
      const bloom = ctx!.createRadialGradient(headX, headY, 0, headX, headY, bloomRadius);
      bloom.addColorStop(0, `rgba(180, 236, 255, ${(0.36 * opacity).toFixed(3)})`);
      bloom.addColorStop(0.35, `rgba(85, 206, 255, ${(0.14 * opacity).toFixed(3)})`);
      bloom.addColorStop(1, "rgba(85, 206, 255, 0)");
      ctx!.fillStyle = bloom;
      ctx!.beginPath();
      ctx!.arc(headX, headY, bloomRadius, 0, Math.PI * 2);
      ctx!.fill();

      /* A cabeça é o ✦ do céu alinhado ao voo: uma ponta vai na frente. */
      drawSparkle(
        headX,
        headY,
        meteor.size * (1 + 0.2 * grown),
        Math.atan2(meteor.vy, meteor.vx) + Math.PI / 2,
        240 * opacity,
        "#EAF8FF",
      );

      ctx!.globalAlpha = 1;
      ctx!.fillStyle = `rgba(255, 255, 255, ${(0.92 * opacity).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(headX, headY, 1.1, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    ctx!.globalAlpha = 1;
  }

  function paint(time: number) {
    ctx!.clearRect(0, 0, width, height);

    for (const star of stars) {
      const level = starLevel(star, time);
      const alpha = star.a * level;
      if (alpha <= 3) continue;

      const x = star.x * width;
      const y = star.y * height;

      if (star.sparkle) {
        const sparkleRadius = star.r * (0.55 + 0.5 * level);
        drawSparkle(x, y, sparkleRadius, time * star.spin + star.rot0, alpha, star.color);
        continue;
      }

      const radius = star.r * (0.7 + 0.55 * level);
      ctx!.globalAlpha = alpha / 255;
      ctx!.fillStyle = star.color;
      ctx!.beginPath();
      ctx!.arc(x, y, radius, 0, Math.PI * 2);
      ctx!.fill();

      if (star.halo) {
        const haloRadius = radius * 4.2;
        const gradient = ctx!.createRadialGradient(x, y, 0, x, y, haloRadius);
        gradient.addColorStop(0, `rgba(${HALO_COLOR},${(alpha / 255) * 0.26})`);
        gradient.addColorStop(1, `rgba(${HALO_COLOR},0)`);
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(x, y, haloRadius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    ctx!.globalAlpha = 1;

    scheduleMeteors(time);
    drawMeteors(time);

    if (!pointer.active) return;

    for (const star of stars) {
      const x = star.x * width;
      const y = star.y * height;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= REACH) continue;

      ctx!.globalAlpha = 1;
      ctx!.strokeStyle = `rgba(85, 206, 255, ${(0.44 * (1 - distance / REACH)).toFixed(3)})`;
      ctx!.lineWidth = 0.75;
      ctx!.beginPath();
      ctx!.moveTo(pointer.x, pointer.y);
      ctx!.lineTo(x, y);
      ctx!.stroke();
    }

    const glow = ctx!.createRadialGradient(
      pointer.x,
      pointer.y,
      0,
      pointer.x,
      pointer.y,
      48,
    );
    glow.addColorStop(0, "rgba(85, 206, 255, 0.24)");
    glow.addColorStop(1, "rgba(85, 206, 255, 0)");
    ctx!.fillStyle = glow;
    ctx!.beginPath();
    ctx!.arc(pointer.x, pointer.y, 48, 0, Math.PI * 2);
    ctx!.fill();

    ctx!.fillStyle = "rgba(143, 224, 255, 0.95)";
    ctx!.beginPath();
    ctx!.arc(pointer.x, pointer.y, 1.8, 0, Math.PI * 2);
    ctx!.fill();
  }

  function frame(now: number) {
    if (!running) return;
    rafId = window.requestAnimationFrame(frame);
    /* 25 fps bastam para o céu; a cadente ganha 60 fps enquanto atravessa. */
    if (now - lastFrame < (meteors.length ? 0 : 40)) return;
    lastFrame = now;
    paint((now - startedAt) / 1000);
  }

  function start() {
    if (running) return;
    running = true;
    startedAt = performance.now() - elapsed * 1000;
    lastFrame = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (running) elapsed = (performance.now() - startedAt) / 1000;
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  return {
    start,
    stop,
    resize,
    pointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    },
    pointerOut() {
      pointer.active = false;
    },
    destroy() {
      stop();
      stars = [];
      pointer.active = false;
    },
  };
}
