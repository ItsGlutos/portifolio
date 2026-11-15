/* ==========================================================================
   Céu estrelado em canvas — portado de fundo-estrelado-escuro.md §5 / §8.3
   - 67 estrelas de referência, densidade adaptativa com teto
   - semente determinística (20261104): o céu é sempre o mesmo lugar
   - cintilação por ruído suave (fbm), sem ciclo: cada estrela respira,
     apaga e reaparece no próprio ritmo
   - 25 fps, pausa apenas com a aba oculta (o céu é o movimento do tema)
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.getElementById("sky");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var SEED = 20261104;
  var PALETTE = ["#6FA8F0", "#8FC2FF", "#5B8FC9", "#A9CCFF", "#4E7FB8"];
  var SPARKLE_PALETTE = ["#A9CCFF", "#C7DEFF", "#8FC2FF", "#D8E9FF"];
  var HALO_COLOR = "156,199,255";

  var stars = [];
  var width = 0;
  var height = 0;
  var dpr = 1;
  var rafId = 0;
  var lastFrame = 0;
  var startedAt = 0;
  var elapsed = 0; // segundos acumulados antes da última pausa
  var running = false;
  var pointer = { x: 0, y: 0, active: false };

  function createRandom(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ── ruído 1D suave ────────────────────────────────────────────────────
     Cada estrela lê dois canais de ruído (brilho e presença). Como o ruído
     não repete um ciclo, o céu nunca "pulsa em bloco" nem se denuncia como
     animação: as estrelas acendem, esmaecem e voltam em tempos diferentes. */
  function hash01(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = Math.imul(n, 9);
    n ^= n >>> 4;
    n = Math.imul(n, 0x27d4eb2d);
    n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
  }

  function noise1(x, seed) {
    var i = Math.floor(x);
    var f = x - i;
    var u = f * f * f * (f * (f * 6 - 15) + 10); // smootherstep
    var off = Math.imul(seed, 668265263);
    var a = hash01(Math.imul(i, 374761393) + off);
    var b = hash01(Math.imul(i + 1, 374761393) + off);
    return a + (b - a) * u; // 0..1
  }

  function fbm(x, seed) {
    return 0.64 * noise1(x, seed) + 0.36 * noise1(x * 2.31 + 7.7, seed + 19);
  }

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function smoothstep01(v) {
    return v * v * (3 - 2 * v);
  }

  function seedStars(count, haloCount, random) {
    stars = [];
    var dustCount = count - haloCount;
    var sparkleCount = Math.max(2, Math.round(dustCount * 0.10));
    var i, tone, rest, floor, gain, a;

    for (i = 0; i < dustCount; i++) {
      if (i < sparkleCount) {
        // estrelas de quatro pontas: giram devagar, brilham mais e apagam.
        stars.push({
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
          c: SPARKLE_PALETTE[(random() * SPARKLE_PALETTE.length) | 0],
          sparkle: true,
          halo: false
        });
        continue;
      }

      // personalidades: firmes, que apenas respiram; discretas, que esmaecem
      // bastante; e as que chegam a apagar antes de reaparecer. As que apagam
      // ganham mais alfa para o sumiço ser visível.
      tone = random();
      if (tone < 0.18) {
        rest = 0.38 + random() * 0.25;
        floor = 0.22 + random() * 0.16;
        a = 70 + random() * 80;
        gain = 1.4;
      } else if (tone < 0.56) {
        rest = 0.03 + random() * 0.12;
        floor = 0.08 + random() * 0.14;
        a = 125 + random() * 90;
        gain = 1.45;
      } else {
        rest = 0;
        floor = 0.01 + random() * 0.07;
        a = 160 + random() * 85;
        gain = 1.55;
      }
      stars.push({
        x: 0.015 + random() * 0.97,
        y: 0.01 + random() * 0.98,
        r: 0.8 + random() * 0.9,
        a: a,
        p: 3.4 + random() * 4.4,      // ritmo do brilho (s)
        ph: random() * 100,           // deslocamento no ruído (s)
        slow: 7.5 + random() * 10.5,  // ritmo da presença (s)
        slowPh: random() * 100,
        rest: rest, floor: floor, gain: gain,
        seed: (random() * 999999) | 0,
        c: PALETTE[(random() * PALETTE.length) | 0],
        sparkle: false,
        halo: false
      });
    }
    for (i = 0; i < haloCount; i++) {
      tone = random();
      stars.push({
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
        c: HALO_COLOR,
        sparkle: false,
        halo: true
      });
    }
  }

  function regenerate() {
    var area = width * height;
    var count = Math.max(24, Math.min(140, Math.round(area / 4500)));
    var haloCount = Math.max(3, Math.round(count / 12));
    seedStars(count, haloCount, createRandom(SEED));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    regenerate();
  }

  function starLevel(s, t) {
    var fast = smoothstep01(fbm(t / s.p + s.ph, s.seed));
    var slow = fbm(t / s.slow + s.slowPh, s.seed + 37);

    // a presença abre e fecha devagar: abaixo do limiar a estrela apaga.
    var gate = smoothstep01(clamp01((slow - 0.28) / 0.48));
    var presence = s.rest + (1 - s.rest) * gate;
    var pulse = s.floor + (1 - s.floor) * fast;

    // ganho devolve o brilho médio que a pausa entre aparições tira.
    return Math.min(1, pulse * presence * s.gain);
  }

  /* Estrela de quatro pontas: cantos côncavos, giro lento e um halo curto.
     O desenho é local (centro em 0,0) para a rotação não deslocar a estrela. */
  function drawSparkle(x, y, radius, angle, alpha, color) {
    var glowRadius = radius * 2.6;
    var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, "rgba(" + HALO_COLOR + "," + (alpha / 255) * 0.16 + ")");
    glow.addColorStop(1, "rgba(" + HALO_COLOR + ",0)");

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // quatro pontas longas com cintura de 14% do raio: lê como ✦ mesmo
    // em 6 px, ao contrário de um losango arredondado.
    var waist = radius * 0.14;
    ctx.globalAlpha = alpha / 255;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var k = 0; k < 8; k++) {
      var angle = -Math.PI / 2 + k * Math.PI / 4;
      var length = k % 2 === 0 ? radius : waist;
      var px = Math.cos(angle) * length;
      var py = Math.sin(angle) * length;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function paint(t) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var level = starLevel(s, t);

      var alpha = s.a * level;
      if (alpha <= 3) continue;

      var x = s.x * width;
      var y = s.y * height;

      if (s.sparkle) {
        var sparkleRadius = s.r * (0.55 + 0.50 * level);
        drawSparkle(x, y, sparkleRadius, t * s.spin + s.rot0, alpha, s.c);
        continue;
      }

      var radius = s.r * (0.7 + 0.55 * level);

      ctx.globalAlpha = alpha / 255;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (s.halo) {
        var haloRadius = radius * 4.2;
        var g = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
        g.addColorStop(0, "rgba(" + HALO_COLOR + "," + (alpha / 255) * 0.26 + ")");
        g.addColorStop(1, "rgba(" + HALO_COLOR + ",0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    /* Constelação de proximidade: o ponteiro vira uma estrela a mais e liga
       apenas as estrelas que estão ao alcance. É a leitura de "céu vivo" da
       direção A, sem tirar o céu do lugar. */
    if (pointer.active) {
      var reach = 168;
      for (var k = 0; k < stars.length; k++) {
        var near = stars[k];
        var dx = near.x * width - pointer.x;
        var dy = near.y * height - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= reach) continue;

        ctx.globalAlpha = 1;
        ctx.strokeStyle =
          "rgba(85, 206, 255, " + (0.44 * (1 - dist / reach)).toFixed(3) + ")";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(near.x * width, near.y * height);
        ctx.stroke();
      }

      var glow = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        48
      );
      glow.addColorStop(0, "rgba(85, 206, 255, 0.24)");
      glow.addColorStop(1, "rgba(85, 206, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(143, 224, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    rafId = window.requestAnimationFrame(frame);

    if (now - lastFrame < 40) return; // ~25 fps
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
    if (running) {
      elapsed = (performance.now() - startedAt) / 1000;
    }
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });

  window.addEventListener(
    "pointermove",
    function (event) {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", function () {
    pointer.active = false;
  });

  window.addEventListener("blur", function () {
    pointer.active = false;
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  window.addEventListener("pagehide", stop);

  resize();
  start();
})();
