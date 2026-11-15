/* ══════════════════════════════════════════════════════════════════════════
   PagFlow — réplica da interface (PyQt6 → HTML/CSS/Canvas)
   Porta fiel de main.py + temas_extra.py: tokens, tipografia, motivos,
   padrões de fundo pintados à mão, estrelas, neve e o fluxo visual das telas.
   Nada é operacional: nenhum arquivo é lido, gerado ou enviado.
   GrupoSC (claro/escuro) fica fora — é o tema corporativo do cliente.
   ══════════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const W = 1280, H = 960;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── utilitários de cor ──────────────────────────────────────────────── */
  const HEX = new Map();
  function rgb(hex) {
    let c = HEX.get(hex);
    if (c) return c;
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    HEX.set(hex, c);
    return c;
  }
  /** alfa em 0–255, como o QColor do app. */
  function rgba(hex, alpha = 255) {
    const [r, g, b] = rgb(hex);
    return `rgba(${r},${g},${b},${(alpha / 255).toFixed(4)})`;
  }

  /* ── random.Random do CPython (MT19937), para o desenho ser idêntico ──── */
  class PyRandom {
    constructor(seed) {
      this.mt = new Uint32Array(624);
      this.index = 624;
      const key = [];
      let n = Math.abs(seed);
      do { key.push(n >>> 0); n = Math.floor(n / 4294967296); } while (n > 0);
      this._initByArray(key);
    }
    _init(seed) {
      this.mt[0] = seed >>> 0;
      for (let i = 1; i < 624; i++) {
        this.mt[i] = (Math.imul(1812433253, this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
      }
    }
    _initByArray(key) {
      this._init(19650218);
      let i = 1, j = 0;
      for (let k = Math.max(624, key.length); k; k--) {
        this.mt[i] = ((this.mt[i] ^ Math.imul(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30), 1664525)) + key[j] + j) >>> 0;
        i++; j++;
        if (i >= 624) { this.mt[0] = this.mt[623]; i = 1; }
        if (j >= key.length) j = 0;
      }
      for (let k = 623; k; k--) {
        this.mt[i] = ((this.mt[i] ^ Math.imul(this.mt[i - 1] ^ (this.mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
        i++;
        if (i >= 624) { this.mt[0] = this.mt[623]; i = 1; }
      }
      this.mt[0] = 0x80000000;
      this.index = 624;
    }
    _u32() {
      if (this.index >= 624) {
        for (let kk = 0; kk < 624; kk++) {
          const y = (this.mt[kk] & 0x80000000) | (this.mt[(kk + 1) % 624] & 0x7fffffff);
          this.mt[kk] = this.mt[(kk + 397) % 624] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
        }
        this.index = 0;
      }
      let y = this.mt[this.index++];
      y ^= y >>> 11;
      y ^= (y << 7) & 0x9d2c5680;
      y ^= (y << 15) & 0xefc60000;
      y ^= y >>> 18;
      return y >>> 0;
    }
    random() {
      const a = this._u32() >>> 5, b = this._u32() >>> 6;
      return (a * 67108864 + b) / 9007199254740992;
    }
    uniform(a, b) { return a + (b - a) * this.random(); }
    getrandbits(k) { return this._u32() >>> (32 - k); }
    _below(n) {
      const k = n.toString(2).length;
      let r = this.getrandbits(k);
      while (r >= n) r = this.getrandbits(k);
      return r;
    }
    randint(a, b) { return a + this._below(b - a + 1); }
    choice(seq) { return seq[this._below(seq.length)]; }
  }

  /* ══════════════════════════════════════════════════════════════════════
     TOKENS — transcrição de main.py (DARK/LIGHT) e temas_extra.py
     ══════════════════════════════════════════════════════════════════════ */
  const ART_DEFAULTS = {
    isLight: false,
    displayFont: "Segoe UI", uiFont: "Segoe UI", monoFont: "Consolas",
    sectionFont: "", buttonFont: "", statusFont: "",
    statusSize: 11, statusTransform: "none", statusTracking: 0,
    brandLabel: "PagFlow", brandSub: "Consolidação de pagamentos SAP",
    brandColor: "", brandSuffix: "", brandSuffixStyle: "normal", brandSuffixColor: "",
    brandSuffixSize: 0, brandSuffixBg: "", brandTransform: "none", brandTracking: 0,
    brandSize: 16, brandDy: 0,
    sectionTransform: "none", sectionTracking: 0, sectionSize: 11,
    buttonTransform: "none", buttonTracking: 0, buttonSize: 12,
    logoMotif: "sheet", logoEmoji: "", logoFrom: "", logoTo: "", logoMid: "", logoMidPos: 0.56,
    logoFg: "", logoBorder: "", logoTile: "", logoShape: "rounded",
    logoIcon: "", pattern: "plain",
    primaryText: "", cardFrom: "", cardTo: "", cardEdgeFrom: "", cardEdgeTo: "",
    cardEdgeHeight: 0, cardAlpha: 0, cardEdgeAlpha: 255, cardRadius: 12,
    fieldHover: "", fieldRadius: 10, chipRadius: 10, accentBorder: "",
    pickFrom: "", pickTo: "", pickHoverFrom: "", pickHoverTo: "", pickFg: "", pickBorder: "",
    chipFrom: "", chipTo: "", chipFg: "",
    badgeBg: "", badgeFg: "", badgeBorder: "", badgeFont: "", badgeTransform: "none", badgeTracking: 0,
    metaFont: "", metaTransform: "none", metaTracking: 0,
    statusBg: "", statusBorder: "", statusFg: "", statusDot: "",
    viewActiveFrom: "", viewActiveTo: "", viewActiveFg: "", viewActiveBorder: "",
    segActiveFrom: "", segActiveTo: "", segActiveFg: "", segActiveBorder: "",
    dialogTitleSize: 23, description: "",
  };

  const THEMES = {
    dark: {
      label: "Escuro", isLight: false,
      bgTop: "#091522", bgBottom: "#11263E", glow: "#2D7DD2", glowAlpha: 32,
      surface: "#112236", surfaceAlpha: 0.88, surfaceAlt: "#162B44",
      border: "#1B3A5C", borderStrong: "#2A567F",
      text: "#E8F0FE", text2: "#94B4D4", muted: "#6F8CAB",
      accent: "#2C77C6", accentHover: "#3A89DA", accentPressed: "#22609C", onAccent: "#FFFFFF",
      accentSoft: "#16324F", accentSoftText: "#9CC7FF",
      field: "#0A1828", fieldFocus: "#0C1E33", fieldBorder: "#1B3A5C", placeholder: "#7694B4",
      okBg: "#12331F", okFg: "#7EE2A8", errBg: "#3A1618", errFg: "#FF9E9E",
      warnBg: "#3A2E12", warnFg: "#FFD479", infoBg: "#14273D", infoFg: "#B7CFEA",
      primaryFrom: "#2C77C6", primaryTo: "#23629F",
      pHoverFrom: "#3585D8", pHoverTo: "#2A6FBA",
      pPressFrom: "#23629F", pPressTo: "#1D5590",
      stars: true, shadowAlpha: 0,
      art: {
        pattern: "stars", logoIcon: "assets/brand/pagflow-dark.png",
        description: "Céu noturno azul-marinho, com estrelas que respiram.",
      },
    },
    light: {
      label: "Claro", isLight: true,
      bgTop: "#E7F2FD", bgBottom: "#FBFDFF", glow: "#FFFFFF", glowAlpha: 150,
      surface: "#FFFFFF", surfaceAlpha: 0.96, surfaceAlt: "#F1F8FE",
      border: "#D9E8F6", borderStrong: "#BED8EC",
      text: "#0B2540", text2: "#4B6A87", muted: "#6F8CA6",
      accent: "#0EA5E9", accentHover: "#38BDF8", accentPressed: "#0284C7", onAccent: "#062338",
      accentSoft: "#E0F2FE", accentSoftText: "#0369A1",
      field: "#FFFFFF", fieldFocus: "#FFFFFF", fieldBorder: "#D5E5F5", placeholder: "#8AA6BF",
      okBg: "#E7F8EF", okFg: "#0E7A44", errBg: "#FDEBEB", errFg: "#B42318",
      warnBg: "#FFF6E4", warnFg: "#8A5A00", infoBg: "#EAF4FD", infoFg: "#1F5C8B",
      primaryFrom: "#38BDF8", primaryTo: "#0EA5E9",
      pHoverFrom: "#4EC5FA", pHoverTo: "#22A9E8",
      pPressFrom: "#0EA5E9", pPressTo: "#0284C7",
      stars: false, shadowAlpha: 26,
      art: {
        pattern: "plain", isLight: true, logoIcon: "assets/brand/pagflow-light.png",
        description: "Céu diurno, com destaque em azul-celeste.",
      },
    },
    acai: {
      label: "Açaí", isLight: false,
      bgTop: "#14001C", bgBottom: "#21042E", glow: "#7E22CE", glowAlpha: 70,
      surface: "#1F002B", surfaceAlpha: 0.9, surfaceAlt: "#2A0838",
      border: "#4C1D6B", borderStrong: "#872EAC",
      text: "#F3E8FF", text2: "#D8B4FE", muted: "#C084FC",
      accent: "#A855F7", accentHover: "#C084FC", accentPressed: "#9333EA", onAccent: "#FFFFFF",
      accentSoft: "#2F0840", accentSoftText: "#E9D5FF",
      field: "#1A0226", fieldFocus: "#230330", fieldBorder: "#4C1D6B", placeholder: "#C084FC",
      okBg: "#14351F", okFg: "#86EFAC", errBg: "#3A0A18", errFg: "#FFB4AB",
      warnBg: "#332400", warnFg: "#FCD34D", infoBg: "#2A0838", infoFg: "#E9D5FF",
      primaryFrom: "#F59E0B", primaryTo: "#FBBF24",
      pHoverFrom: "#FBBF24", pHoverTo: "#FCD34D",
      pPressFrom: "#D97706", pPressTo: "#F59E0B",
      stars: false, shadowAlpha: 0,
      art: {
        displayFont: "Sora", uiFont: "Sora", monoFont: "JetBrains Mono",
        sectionFont: "Sora", buttonFont: "Sora", statusFont: "Sora",
        brandSuffix: "Açaí", brandSuffixColor: "#FBBF24",
        sectionTracking: 0.005, buttonTracking: 0.005,
        logoEmoji: "🫐", logoMotif: "berry", logoFrom: "#2F0840", logoTo: "#581275",
        logoFg: "#FBBF24", logoBorder: "#F59E0B", pattern: "dotgrid",
        primaryText: "#201C00", cardFrom: "#2F0840", cardTo: "#1A0226",
        chipFrom: "#7E22CE", chipTo: "#A855F7", chipFg: "#FFFFFF",
        badgeBg: "#2F0840", badgeFg: "#FCD34D", badgeBorder: "#F59E0B",
        statusBg: "#1A0226", statusBorder: "#4C1D6B", statusFg: "#D8B4FE", statusDot: "#FBBF24",
        viewActiveFrom: "#7E22CE", viewActiveTo: "#A855F7", viewActiveFg: "#FFFFFF",
        viewActiveBorder: "#C084FC",
        segActiveFrom: "#7E22CE", segActiveTo: "#A855F7", segActiveFg: "#FFFFFF",
        segActiveBorder: "#C084FC",
        cardEdgeFrom: "#F59E0B", cardEdgeTo: "#F59E0B", cardEdgeHeight: 1,
        cardAlpha: 0.9, cardEdgeAlpha: 140, brandSize: 16, brandDy: 4,
        description: "Roxo profundo, dourado, brilho premium e textura de açaí.",
      },
    },
    graduation: {
      label: "Graduation", isLight: true,
      bgTop: "#FBF7FF", bgBottom: "#FFF0F7", glow: "#FF7AB8", glowAlpha: 40,
      surface: "#FFFFFF", surfaceAlpha: 0.84, surfaceAlt: "#FDF2FF",
      border: "#E9D5FF", borderStrong: "#D8B4FE",
      text: "#1C1033", text2: "#581C87", muted: "#7E22CE",
      accent: "#DB2777", accentHover: "#EC4899", accentPressed: "#BE185D", onAccent: "#FFFFFF",
      accentSoft: "#FCE7F3", accentSoftText: "#9D174D",
      field: "#FFFFFF", fieldFocus: "#FFFFFF", fieldBorder: "#E9D5FF", placeholder: "#A78BFA",
      okBg: "#ECFDF5", okFg: "#047857", errBg: "#FFF1F2", errFg: "#BE123C",
      warnBg: "#FFFBEB", warnFg: "#B45309", infoBg: "#EFF6FF", infoFg: "#1D4ED8",
      primaryFrom: "#FF3388", primaryTo: "#A21CAF",
      pHoverFrom: "#FF4F9A", pHoverTo: "#B32BC4",
      pPressFrom: "#E11D74", pPressTo: "#86198F",
      stars: false, shadowAlpha: 26,
      art: {
        displayFont: "Outfit", uiFont: "Space Grotesk", monoFont: "JetBrains Mono",
        sectionFont: "Outfit", buttonFont: "Space Grotesk", statusFont: "Space Grotesk",
        brandSuffix: "Graduation", brandSuffixColor: "#DB2777",
        sectionTracking: 0.01, buttonTracking: 0.01,
        logoEmoji: "🐻", logoMotif: "flower", logoFrom: "#FFC400", logoTo: "#A21CAF",
        logoMid: "#FF3388", logoFg: "#FFFFFF", logoBorder: "#FFFFFF", pattern: "clouds",
        primaryText: "#FFFFFF", cardFrom: "#FFFFFF", cardTo: "#FFF0FA",
        chipFrom: "#FF3388", chipTo: "#A21CAF", chipFg: "#FFFFFF",
        badgeBg: "#FCE7F3", badgeFg: "#9D174D", badgeBorder: "#F9A8D4",
        statusBg: "#FFFFFF", statusBorder: "#E9D5FF", statusFg: "#581C87", statusDot: "#DB2777",
        viewActiveFrom: "#FCE7F3", viewActiveTo: "#FCE7F3", viewActiveFg: "#9D174D",
        viewActiveBorder: "#F472B6",
        segActiveFrom: "#FFD400", segActiveTo: "#FFB800", segActiveFg: "#522B00",
        segActiveBorder: "#F59E0B", cardAlpha: 0.94, brandSize: 16, brandDy: 4,
        description: "Nuvens pastel, rosa choque, azul-céu e amarelo de verão.",
      },
    },
    lana: {
      label: "Lana Del Rey", isLight: true,
      bgTop: "#FFF8F8", bgBottom: "#FFE8ED", glow: "#FFB1C1", glowAlpha: 60,
      surface: "#FFFDFC", surfaceAlpha: 0.92, surfaceAlt: "#FFF0F3",
      border: "#E3BDBD", borderStrong: "#C81D3B",
      text: "#25181C", text2: "#5B4040", muted: "#894C5A",
      accent: "#A10028", accentHover: "#C81D3B", accentPressed: "#7F0020", onAccent: "#FFFFFF",
      accentSoft: "#FFE8ED", accentSoftText: "#A10028",
      field: "#FFFDFC", fieldFocus: "#FFF8F8", fieldBorder: "#E3BDBD", placeholder: "#B98A94",
      okBg: "#F0FDF4", okFg: "#166534", errBg: "#FFF1F2", errFg: "#9F1239",
      warnBg: "#FFF7ED", warnFg: "#9A3412", infoBg: "#FFF0F3", infoFg: "#A10028",
      primaryFrom: "#C81D3B", primaryTo: "#A10028",
      pHoverFrom: "#D92B4A", pHoverTo: "#B3002D",
      pPressFrom: "#A10028", pPressTo: "#7F0020",
      stars: false, shadowAlpha: 22,
      art: {
        displayFont: "Playfair Display", uiFont: "Plus Jakarta Sans", monoFont: "JetBrains Mono",
        sectionFont: "Playfair Display", buttonFont: "Plus Jakarta Sans", statusFont: "Plus Jakarta Sans",
        brandSuffix: "Lana Del Rey", brandSuffixStyle: "italic", brandSuffixColor: "#A10028",
        brandSize: 17, brandDy: 3, sectionSize: 12,
        logoEmoji: "🍒", logoMotif: "cherry", logoFrom: "#C81D3B", logoTo: "#7F0020",
        logoFg: "#FFF8F8", logoBorder: "#FFFFFF", pattern: "paper",
        primaryText: "#FFFFFF", cardFrom: "#FFFDFC", cardTo: "#FFFDFC",
        chipFrom: "#C81D3B", chipTo: "#A10028", chipFg: "#FFFFFF",
        badgeBg: "#FFE8ED", badgeFg: "#A10028", badgeBorder: "#E3BDBD",
        statusBg: "#FFF0F3", statusBorder: "#E3BDBD", statusFg: "#5B4040", statusDot: "#A10028",
        viewActiveFrom: "#C81D3B", viewActiveTo: "#A10028", viewActiveFg: "#FFFFFF",
        viewActiveBorder: "#A10028",
        segActiveFrom: "#C81D3B", segActiveTo: "#A10028", segActiveFg: "#FFFFFF",
        segActiveBorder: "#A10028",
        cardEdgeFrom: "#A10028", cardEdgeTo: "#A10028", cardEdgeHeight: 2,
        cardAlpha: 0.94, dialogTitleSize: 24,
        description: "Papel marfim, cereja vintage, rosa blush e melancolia editorial.",
      },
    },
    ozzy: {
      label: "Ozzy", isLight: false,
      bgTop: "#0B0A0A", bgBottom: "#1A1010", glow: "#920703", glowAlpha: 70,
      surface: "#1D1B1B", surfaceAlpha: 0.94, surfaceAlt: "#2C2929",
      border: "#373434", borderStrong: "#4B4731",
      text: "#E8E1E0", text2: "#CDC7AA", muted: "#969177",
      accent: "#FBE500", accentHover: "#FFF23D", accentPressed: "#D9C700", onAccent: "#201C00",
      accentSoft: "#373100", accentSoftText: "#FBE500",
      field: "#151313", fieldFocus: "#1B1818", fieldBorder: "#373434", placeholder: "#969177",
      okBg: "#1A2410", okFg: "#C6F26B", errBg: "#2A0A08", errFg: "#FFB4AB",
      warnBg: "#332400", warnFg: "#FFD479", infoBg: "#201C00", infoFg: "#CDC7AA",
      primaryFrom: "#FBE500", primaryTo: "#E8C900",
      pHoverFrom: "#FFF23D", pHoverTo: "#F5D400",
      pPressFrom: "#D9C700", pPressTo: "#C7B400",
      stars: false, shadowAlpha: 0,
      art: {
        displayFont: "Anton", uiFont: "Space Grotesk", monoFont: "JetBrains Mono",
        sectionFont: "Space Grotesk", buttonFont: "Space Grotesk", statusFont: "JetBrains Mono",
        statusSize: 10, statusTransform: "uppercase",
        brandLabel: "PAGFLOW", brandSuffix: "OZZY", brandSuffixColor: "#FBE500",
        brandTransform: "uppercase", brandTracking: 0.025, brandSize: 17, brandDy: 5,
        sectionTransform: "uppercase", sectionTracking: 0.08,
        buttonTransform: "uppercase", buttonTracking: 0.08, buttonSize: 11,
        logoEmoji: "🦇", logoMotif: "bolt", logoFrom: "#0D0B0B", logoTo: "#0D0B0B",
        logoFg: "#FBE500", logoBorder: "#4B4731", pattern: "grain",
        primaryText: "#201C00", cardFrom: "#1D1B1B", cardTo: "#1D1B1B",
        chipFrom: "#FBE500", chipTo: "#E8C900", chipFg: "#201C00",
        badgeBg: "#373100", badgeFg: "#FBE500", badgeBorder: "#706500",
        badgeFont: "JetBrains Mono", badgeTransform: "uppercase", badgeTracking: 0.1,
        metaFont: "JetBrains Mono", metaTransform: "uppercase", metaTracking: 0.1,
        statusBg: "#141212", statusBorder: "#373434", statusFg: "#FFB4A8", statusDot: "#FBE500",
        viewActiveFrom: "#FBE500", viewActiveTo: "#E8C900", viewActiveFg: "#201C00",
        viewActiveBorder: "#FBE500",
        segActiveFrom: "#FBE500", segActiveTo: "#E8C900", segActiveFg: "#201C00",
        segActiveBorder: "#FBE500",
        cardEdgeFrom: "#920703", cardEdgeTo: "#FBE500", cardEdgeHeight: 2,
        cardAlpha: 0.94, cardEdgeAlpha: 140,
        description: "Palco preto, vermelho sangue, amarelo high gain e tipografia de pôster.",
      },
    },
    vaporwave: {
      label: "Vaporwave", isLight: false,
      bgTop: "#1E182E", bgBottom: "#100A21", glow: "#FF4A8D", glowAlpha: 64,
      surface: "#221C34", surfaceAlpha: 0.9, surfaceAlt: "#2D263F",
      border: "#2D263F", borderStrong: "#4A3F66",
      text: "#E8DDFE", text2: "#E5BCC5", muted: "#B9A7D6",
      accent: "#00EEFC", accentHover: "#7DF4FF", accentPressed: "#00C8D4", onAccent: "#00363A",
      accentSoft: "#00363A", accentSoftText: "#7DF4FF",
      field: "#100A21", fieldFocus: "#151027", fieldBorder: "#2D263F", placeholder: "#8F7FAF",
      okBg: "#00363A", okFg: "#7DF4FF", errBg: "#3A0A1E", errFg: "#FFB1C4",
      warnBg: "#3A2400", warnFg: "#FFB77F", infoBg: "#221C34", infoFg: "#D3FBFF",
      primaryFrom: "#FF4A8D", primaryTo: "#DC7600",
      pHoverFrom: "#FF6FA3", pHoverTo: "#E88800",
      pPressFrom: "#E03A7C", pPressTo: "#C26700",
      stars: false, shadowAlpha: 0,
      art: {
        displayFont: "Playfair Display", uiFont: "Chivo", monoFont: "JetBrains Mono",
        sectionFont: "Playfair Display", buttonFont: "Chivo", statusFont: "JetBrains Mono",
        statusSize: 10, statusTransform: "uppercase", statusTracking: 0.08,
        brandSuffix: "LA NEON NIGHTS", brandSuffixColor: "#FFB1C4", brandSuffixSize: 11,
        brandTransform: "uppercase", brandTracking: 0.02, brandSize: 20, brandDy: 3,
        sectionTransform: "uppercase", sectionTracking: 0.06, sectionSize: 13,
        buttonTransform: "uppercase", buttonTracking: 0.06,
        logoEmoji: "🌴", logoMotif: "sheet", pattern: "vaporwave",
        primaryText: "#590028", cardFrom: "#221C34", cardTo: "#1E182E",
        cardEdgeFrom: "#FF4A8D", cardEdgeTo: "#00EEFC", cardEdgeHeight: 1,
        cardAlpha: 0.88, cardEdgeAlpha: 190,
        chipFrom: "#FF4A8D", chipTo: "#DC7600", chipFg: "#590028",
        badgeBg: "#2D263F", badgeFg: "#D3FBFF", badgeBorder: "#3C354F",
        badgeFont: "JetBrains Mono", badgeTransform: "uppercase", badgeTracking: 0.08,
        metaFont: "JetBrains Mono", metaTransform: "uppercase", metaTracking: 0.1,
        statusBg: "#151027", statusBorder: "#2D263F", statusFg: "#7DF4FF", statusDot: "#00EEFC",
        viewActiveFrom: "#FF4A8D", viewActiveTo: "#FF4A8D", viewActiveFg: "#590028",
        viewActiveBorder: "#FFB1C4",
        segActiveFrom: "#FFB77F", segActiveTo: "#FF8A3D", segActiveFg: "#4E2600",
        segActiveBorder: "#FFD1A8", dialogTitleSize: 24,
        description: "Rosa neon, ciano elétrico, pôr do sol em grade e noites de Los Angeles.",
      },
    },
    alien: {
      label: "Alien", isLight: false,
      bgTop: "#111413", bgBottom: "#0C0F0E", glow: "#00FF66", glowAlpha: 34,
      surface: "#191C1B", surfaceAlpha: 0.92, surfaceAlt: "#1D201F",
      border: "#282B29", borderStrong: "#3A3D3B",
      text: "#EDFFE8", text2: "#B9CCB5", muted: "#849581",
      accent: "#00FF66", accentHover: "#6BFF83", accentPressed: "#00E55B", onAccent: "#002107",
      accentSoft: "#003911", accentSoftText: "#6BFF83",
      field: "#0C0F0E", fieldFocus: "#111413", fieldBorder: "#1D201F", placeholder: "#849581",
      okBg: "#003911", okFg: "#6BFF83", errBg: "#2A0A08", errFg: "#FFB4AB",
      warnBg: "#332400", warnFg: "#FFB95F", infoBg: "#191C1B", infoFg: "#B9CCB5",
      primaryFrom: "#00FF66", primaryTo: "#00E55B",
      pHoverFrom: "#6BFF83", pHoverTo: "#00FF66",
      pPressFrom: "#00E55B", pPressTo: "#00C24E",
      stars: false, shadowAlpha: 0,
      art: {
        displayFont: "JetBrains Mono", uiFont: "JetBrains Mono", monoFont: "JetBrains Mono",
        sectionFont: "JetBrains Mono", buttonFont: "JetBrains Mono", statusFont: "JetBrains Mono",
        statusSize: 10, statusTransform: "uppercase", statusTracking: 0.1,
        brandLabel: "PAGFLOW", brandSuffix: "MU-TH-UR", brandSuffixColor: "#6BFF83",
        brandTransform: "uppercase", brandTracking: 0.04, brandSize: 18, brandDy: 3,
        sectionTransform: "uppercase", sectionTracking: 0.08, sectionSize: 10,
        buttonTransform: "uppercase", buttonTracking: 0.07, buttonSize: 11,
        logoEmoji: "👽", logoMotif: "sheet", pattern: "terminal",
        primaryText: "#002107", cardFrom: "#191C1B", cardTo: "#111413",
        cardEdgeFrom: "#00FF66", cardEdgeTo: "#00E55B", cardEdgeHeight: 1,
        cardAlpha: 0.92, cardEdgeAlpha: 170, cardRadius: 4,
        fieldHover: "#00B84A", chipRadius: 2,
        chipFrom: "#00FF66", chipTo: "#00E55B", chipFg: "#002107",
        badgeBg: "#003911", badgeFg: "#6BFF83", badgeBorder: "#007128",
        badgeFont: "JetBrains Mono", badgeTransform: "uppercase", badgeTracking: 0.1,
        metaFont: "JetBrains Mono", metaTransform: "uppercase", metaTracking: 0.1,
        statusBg: "#0C0F0E", statusBorder: "#282B29", statusFg: "#B9CCB5", statusDot: "#00FF66",
        viewActiveFrom: "#00FF66", viewActiveTo: "#00E55B", viewActiveFg: "#002107",
        viewActiveBorder: "#6BFF83",
        segActiveFrom: "#00FF66", segActiveTo: "#00E55B", segActiveFg: "#002107",
        segActiveBorder: "#6BFF83", dialogTitleSize: 24,
        description: "Terminal Nostromo, fósforo verde e alerta âmbar.",
      },
    },
    wolverine: {
      label: "Wolverine", isLight: true,
      bgTop: "#FAF8FF", bgBottom: "#EAEDFF", glow: "#F5BA13", glowAlpha: 30,
      surface: "#FFFFFF", surfaceAlpha: 0.96, surfaceAlt: "#EEF0FF",
      border: "#131B2E", borderStrong: "#3B5E9A",
      text: "#131B2E", text2: "#4F4633", muted: "#7A6E58",
      accent: "#3B5E9A", accentHover: "#4F73B8", accentPressed: "#2F4E85", onAccent: "#FFFFFF",
      accentSoft: "#EAEDFF", accentSoftText: "#131B2E",
      field: "#F7F8FF", fieldFocus: "#FFFFFF", fieldBorder: "#C9CFE6", placeholder: "#7A6E58",
      okBg: "#E8F5E9", okFg: "#1F7A3D", errBg: "#FFEBEE", errFg: "#A5000E",
      warnBg: "#FFF7DF", warnFg: "#795900", infoBg: "#EAEDFF", infoFg: "#131B2E",
      primaryFrom: "#F5BA13", primaryTo: "#FFC933",
      pHoverFrom: "#FFC94A", pHoverTo: "#FFD766",
      pPressFrom: "#DA9C00", pPressTo: "#E8AC00",
      stars: false, shadowAlpha: 26,
      art: {
        displayFont: "Chivo", uiFont: "Space Grotesk", monoFont: "JetBrains Mono",
        sectionFont: "Space Grotesk", buttonFont: "Chivo", statusFont: "Space Grotesk",
        statusSize: 10, statusTransform: "uppercase", statusTracking: 0.08,
        brandLabel: "PAGFLOW", brandSuffix: "WOLVERINE", brandSuffixColor: "#131B2E",
        brandSuffixBg: "#F5BA13", brandTransform: "uppercase", brandTracking: 0.03,
        brandSize: 18, brandDy: 3,
        sectionTransform: "uppercase", sectionTracking: 0.05, sectionSize: 12,
        buttonTransform: "uppercase", buttonTracking: 0.05, buttonSize: 11,
        logoEmoji: "🐺", logoMotif: "sheet", logoTile: "#F5BA13", logoBorder: "#131B2E",
        pattern: "halftone", primaryText: "#131B2E", cardFrom: "#FFFFFF", cardTo: "#F7F8FF",
        cardEdgeFrom: "#F5BA13", cardEdgeTo: "#3B5E9A", cardEdgeHeight: 2,
        cardAlpha: 0.97, cardEdgeAlpha: 220, cardRadius: 6,
        fieldHover: "#3B5E9A", chipRadius: 2,
        chipFrom: "#F5BA13", chipTo: "#FFC933", chipFg: "#131B2E",
        badgeBg: "#131B2E", badgeFg: "#FFFFFF", badgeBorder: "#F5BA13",
        badgeFont: "Space Grotesk", badgeTransform: "uppercase", badgeTracking: 0.08,
        metaFont: "Space Grotesk", metaTransform: "uppercase", metaTracking: 0.08,
        statusBg: "#EAEDFF", statusBorder: "#3B5E9A", statusFg: "#131B2E", statusDot: "#F5BA13",
        viewActiveFrom: "#F5BA13", viewActiveTo: "#FFC933", viewActiveFg: "#131B2E",
        viewActiveBorder: "#131B2E",
        segActiveFrom: "#F5BA13", segActiveTo: "#FFC933", segActiveFg: "#131B2E",
        segActiveBorder: "#131B2E", dialogTitleSize: 24,
        description: "Amarelo tigre, azul X-Men e garras de adamantium.",
      },
    },
    flowerboy: {
      label: "Flower Boy", isLight: true,
      bgTop: "#FFF8F5", bgBottom: "#FFEADF", glow: "#F59E0B", glowAlpha: 36,
      surface: "#FFFFFF", surfaceAlpha: 0.95, surfaceAlt: "#FFF8F5",
      border: "#F2DCCB", borderStrong: "#D8C3AD",
      text: "#2B1709", text2: "#534434", muted: "#855300",
      accent: "#3B6934", accentHover: "#4C8043", accentPressed: "#2E5329", onAccent: "#FFFFFF",
      accentSoft: "#FFEADF", accentSoftText: "#A83900",
      field: "#FFF8F5", fieldFocus: "#FFFFFF", fieldBorder: "#F2DCCB", placeholder: "#8A6248",
      okBg: "#EAF5E3", okFg: "#2E5329", errBg: "#FFE3D4", errFg: "#A83900",
      warnBg: "#FFF1D6", warnFg: "#855300", infoBg: "#FFF8F5", infoFg: "#534434",
      primaryFrom: "#F59E0B", primaryTo: "#FC6018",
      pHoverFrom: "#FFB02E", pHoverTo: "#FF7A33",
      pPressFrom: "#DA8500", pPressTo: "#E04E0B",
      stars: false, shadowAlpha: 24,
      art: {
        displayFont: "Playfair Display", uiFont: "Plus Jakarta Sans", monoFont: "JetBrains Mono",
        sectionFont: "Playfair Display", buttonFont: "Plus Jakarta Sans", statusFont: "Plus Jakarta Sans",
        statusSize: 10, statusTransform: "uppercase", statusTracking: 0.06,
        brandLabel: "PAGFLOW", brandSuffix: "FLOWER BOY", brandSuffixColor: "#A83900",
        brandTransform: "uppercase", brandTracking: 0.01, brandSize: 20, brandDy: 3,
        sectionTransform: "uppercase", sectionTracking: 0.04, sectionSize: 12,
        buttonTransform: "uppercase", buttonTracking: 0.04, buttonSize: 11,
        logoEmoji: "🌻", logoMotif: "sheet", logoTile: "#FFF8F5", logoBorder: "#F2DCCB",
        pattern: "sunflower", primaryText: "#2B1709", cardFrom: "#FFFFFF", cardTo: "#FFF8F5",
        cardEdgeFrom: "#F59E0B", cardEdgeTo: "#FC6018", cardEdgeHeight: 1,
        cardAlpha: 0.96, cardEdgeAlpha: 140, cardRadius: 20,
        fieldHover: "#A88164", chipRadius: 10, accentBorder: "#A83900",
        chipFrom: "#F59E0B", chipTo: "#FC6018", chipFg: "#2B1709",
        badgeBg: "#FFEADF", badgeFg: "#A83900", badgeBorder: "#F2DCCB",
        badgeFont: "Plus Jakarta Sans", badgeTransform: "uppercase", badgeTracking: 0.06,
        metaFont: "Plus Jakarta Sans", metaTransform: "uppercase", metaTracking: 0.06,
        statusBg: "#FFF8F5", statusBorder: "#F2DCCB", statusFg: "#534434", statusDot: "#3B6934",
        viewActiveFrom: "#F59E0B", viewActiveTo: "#FC6018", viewActiveFg: "#2B1709",
        viewActiveBorder: "#D8C3AD",
        segActiveFrom: "#F59E0B", segActiveTo: "#FC6018", segActiveFg: "#2B1709",
        segActiveBorder: "#D8C3AD", dialogTitleSize: 24,
        description: "Pêssego, girassol, rádio ao pôr do sol e vinis de verão.",
      },
    },
    natal: {
      label: "Natal", isLight: true,
      bgTop: "#F4FCF7", bgBottom: "#E4F1E9", glow: "#2D6F45", glowAlpha: 26,
      surface: "#FFFFFF", surfaceAlpha: 0.96, surfaceAlt: "#EEF8F1",
      border: "#D6E8DC", borderStrong: "#B8D4C2",
      text: "#151D1A", text2: "#5B4040", muted: "#6B7C72",
      accent: "#286B41", accentHover: "#2F7D4C", accentPressed: "#07522B", onAccent: "#FFFFFF",
      accentSoft: "#E6F0EA", accentSoftText: "#07522B",
      field: "#FFFFFF", fieldFocus: "#F7FCF8", fieldBorder: "#D6E8DC", placeholder: "#7C8D82",
      okBg: "#E6F5EA", okFg: "#0A5D37", errBg: "#FFE4E4", errFg: "#9E0027",
      warnBg: "#FFF6E0", warnFg: "#684700", infoBg: "#EEF8F1", infoFg: "#286B41",
      primaryFrom: "#C41E3A", primaryTo: "#9E0027",
      pHoverFrom: "#D92E4B", pHoverTo: "#B01230",
      pPressFrom: "#9E0027", pPressTo: "#7A0020",
      stars: false, shadowAlpha: 24,
      art: {
        displayFont: "Playfair Display", uiFont: "Plus Jakarta Sans", monoFont: "JetBrains Mono",
        sectionFont: "Plus Jakarta Sans", buttonFont: "Plus Jakarta Sans",
        statusFont: "Plus Jakarta Sans",
        statusSize: 10, statusTransform: "uppercase", statusTracking: 0.06,
        brandSuffix: "Natal", brandSuffixColor: "#C41E3A",
        brandSize: 20, brandDy: 2,
        sectionTransform: "uppercase", sectionTracking: 0.06, sectionSize: 11,
        buttonTransform: "uppercase", buttonTracking: 0.05, buttonSize: 11,
        logoMotif: "tree", logoEmoji: "🎄", logoFrom: "#07522B", logoTo: "#0E7A44",
        logoMid: "#0A6337", logoFg: "#FABC4C", logoBorder: "#FABC4C", logoTile: "#9E0027",
        pattern: "snow", primaryText: "#FFFFFF", cardFrom: "#FFFFFF", cardTo: "#F7FCF8",
        cardEdgeFrom: "#C41E3A", cardEdgeTo: "#FABC4C", cardEdgeHeight: 2,
        cardAlpha: 0.97, cardEdgeAlpha: 180, cardRadius: 16,
        fieldHover: "#A9C7B6", chipRadius: 12, accentBorder: "#286B41",
        chipFrom: "#C41E3A", chipTo: "#9E0027", chipFg: "#FFFFFF",
        badgeBg: "#FFE9E6", badgeFg: "#9E0027", badgeBorder: "#F3C7C0",
        badgeFont: "Plus Jakarta Sans", badgeTransform: "uppercase", badgeTracking: 0.05,
        metaFont: "Plus Jakarta Sans", metaTransform: "uppercase", metaTracking: 0.06,
        statusBg: "#FFFFFF", statusBorder: "#D6E8DC", statusFg: "#5B4040", statusDot: "#286B41",
        viewActiveFrom: "#286B41", viewActiveTo: "#07522B", viewActiveFg: "#FFFFFF",
        viewActiveBorder: "#286B41",
        segActiveFrom: "#C41E3A", segActiveTo: "#9E0027", segActiveFg: "#FFFFFF",
        segActiveBorder: "#9E0027", dialogTitleSize: 26,
        description: "Verde pinheiro, vermelho de festa, dourado e neve de fim de ano.",
      },
    },
    leila: {
      label: "Leila", isLight: true,
      bgTop: "#F7F9FF", bgBottom: "#E9EFFF", glow: "#2563EB", glowAlpha: 18,
      surface: "#FFFFFF", surfaceAlpha: 0.97, surfaceAlt: "#F0F3FF",
      border: "#DEE8FE", borderStrong: "#C3C6D7",
      text: "#121C2B", text2: "#434655", muted: "#7A87A3",
      accent: "#2563EB", accentHover: "#3B82F6", accentPressed: "#004AC6", onAccent: "#FFFFFF",
      accentSoft: "#E7EEFF", accentSoftText: "#004AC6",
      field: "#F0F3FF", fieldFocus: "#FFFFFF", fieldBorder: "#DEE8FE", placeholder: "#8794AE",
      okBg: "#E7EEFF", okFg: "#004AC6", errBg: "#FFDAD6", errFg: "#93000A",
      warnBg: "#FFDDB8", warnFg: "#855300", infoBg: "#E7EEFF", infoFg: "#004AC6",
      primaryFrom: "#2563EB", primaryTo: "#004AC6",
      pHoverFrom: "#3B82F6", pHoverTo: "#2563EB",
      pPressFrom: "#004AC6", pPressTo: "#003A9E",
      stars: false, shadowAlpha: 24,
      art: {
        displayFont: "Plus Jakarta Sans", uiFont: "Plus Jakarta Sans", monoFont: "Plus Jakarta Sans",
        sectionFont: "Plus Jakarta Sans", buttonFont: "Plus Jakarta Sans",
        statusFont: "Plus Jakarta Sans",
        statusSize: 10, statusTracking: 0.01,
        brandSub: "LEILA EU TE AMO", brandColor: "#2563EB",
        brandSuffix: "Leila", brandSuffixColor: "#855300", brandSuffixSize: 12,
        brandSuffixBg: "#FFDDB8", brandSize: 20, brandDy: 2, sectionSize: 12,
        buttonTransform: "uppercase", buttonTracking: 0.04, buttonSize: 11,
        logoMotif: "paw", logoEmoji: "🐶", logoFrom: "#FEA619", logoMid: "#F08A00",
        logoTo: "#C96A00", logoFg: "#FFFFFF", logoBorder: "#FEA619",
        logoTile: "#FFF3E3", logoShape: "circle", pattern: "leila",
        primaryText: "#FFFFFF", cardFrom: "#FFFFFF", cardTo: "#FFFFFF",
        cardAlpha: 0.97, cardRadius: 16,
        fieldHover: "#B9C8E8", fieldRadius: 14, chipRadius: 10, accentBorder: "#2563EB",
        pickFrom: "#FFDDB8", pickTo: "#FEA619", pickHoverFrom: "#FEA619", pickHoverTo: "#F08A00",
        pickFg: "#2A1700", pickBorder: "#F0B060",
        chipFrom: "#2563EB", chipTo: "#004AC6", chipFg: "#FFFFFF",
        badgeBg: "#E7EEFF", badgeFg: "#004AC6", badgeBorder: "#C9D5EE",
        badgeFont: "Plus Jakarta Sans", badgeTracking: 0.04,
        metaFont: "Plus Jakarta Sans", metaTransform: "uppercase", metaTracking: 0.06,
        statusBg: "#FFFFFF", statusBorder: "#DEE8FE", statusFg: "#434655", statusDot: "#2563EB",
        viewActiveFrom: "#2563EB", viewActiveTo: "#004AC6", viewActiveFg: "#FFFFFF",
        viewActiveBorder: "#2563EB",
        segActiveFrom: "#2563EB", segActiveTo: "#004AC6", segActiveFg: "#FFFFFF",
        segActiveBorder: "#2563EB", dialogTitleSize: 28,
        description: "Azul royal, lavanda, caramelo e o Caramelo por perto.",
      },
    },
  };

  const ORDER = ["dark", "light", "graduation", "ozzy", "lana", "acai",
    "vaporwave", "alien", "wolverine", "flowerboy", "natal", "leila"];
  const CORE = new Set(["dark", "light"]);
  const CODES = {
    graduation: ["graduation", "graduation2007", "murakami", "goodmorning", "kanyewest"],
    ozzy: ["ozzy", "ozzyosbourne", "princedarkness", "nomoretours", "blizzardofozz"],
    lana: ["lana", "lanadelrey", "summertime", "borntodie", "hollywoodsadcore"],
    acai: ["acai", "acainight", "premium", "acairespecial"],
    vaporwave: ["vaporwave", "laneonnights", "sunsetblvd", "neonnights"],
    alien: ["alien", "nostromo", "weyland", "muthtur", "xenomorph", "lv426"],
    wolverine: ["wolverine", "logan", "weaponx", "xmen", "adamantium", "snikt"],
    flowerboy: ["flowerboy", "tylerthecreator", "sunflower", "golfwang", "sffb"],
    natal: ["natal", "christmas", "noel", "feliznatal", "xmas", "holiday", "papainoel"],
    leila: ["leila", "caramelo", "leilaecaramelo", "labrador", "caramel"],
  };
  const normalize = (txt) => String(txt).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
  const CODE_TO_KEY = {};
  Object.entries(CODES).forEach(([key, list]) => list.forEach((c) => { CODE_TO_KEY[normalize(c)] = key; }));

  const FONT_STACK = {
    "Segoe UI": '"Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
    "Sora": '"Sora", "Segoe UI", sans-serif',
    "Outfit": '"Outfit", "Segoe UI", sans-serif',
    "Space Grotesk": '"Space Grotesk", "Segoe UI", sans-serif',
    "Playfair Display": '"Playfair Display", Georgia, serif',
    "Plus Jakarta Sans": '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    "Anton": '"Anton", "Segoe UI", Impact, sans-serif',
    "Chivo": '"Chivo", "Segoe UI", sans-serif',
    "JetBrains Mono": '"JetBrains Mono", Consolas, monospace',
    "Consolas": '"Cascadia Code", Consolas, monospace',
  };
  const fontStack = (name) => FONT_STACK[name] || FONT_STACK["Segoe UI"];
  const px = (n) => `${n}px`;
  const em = (tracking, size) => px(+(tracking * size).toFixed(2));

  const COVERS = {
    graduation: ["theme-art-01.jpg", 560, 0.40],
    ozzy: ["theme-art-02.jpg", 540, 0.55],
    flowerboy: ["theme-art-03.jpg", 560, 0.30],
  };

  /* ── estado ──────────────────────────────────────────────────────────── */
  const state = {
    key: "dark",
    tab: 0,
    seg: 3,
    color: "Azul",
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    reducedPref: false,
    unlocked: new Set(),
    busy: false,
    status: { text: "Pronto para uso.", kind: "idle" },
    scale: 1,
  };

  /* ══════════════════════════════════════════════════════════════════════
     TEMA → variáveis CSS
     ══════════════════════════════════════════════════════════════════════ */
  const RESOLVED = new Map();
  function resolveTheme(key) {
    const cached = RESOLVED.get(key);
    if (cached) return cached;
    RESOLVED.set(key, computeTheme(key));
    return RESOLVED.get(key);
  }
  function computeTheme(key) {
    const t = THEMES[key];
    const art = Object.assign({}, ART_DEFAULTS, t.art || {});
    art.isLight = !!(t.isLight ?? (t.art && t.art.isLight));
    const chipFrom = art.chipFrom || t.accent;
    const chipTo = art.chipTo || t.accent;
    const cardAlpha = Math.round((art.cardAlpha || t.surfaceAlpha) * 255);
    const cardBg = art.cardFrom
      ? `linear-gradient(180deg, ${rgba(art.cardFrom, cardAlpha)}, ${rgba(art.cardTo || art.cardFrom, cardAlpha)})`
      : rgba(t.surface, cardAlpha);
    const edgeAlpha = art.cardEdgeAlpha;
    const cardEdge = art.cardEdgeHeight && art.cardEdgeFrom
      ? `linear-gradient(90deg, ${rgba(art.cardEdgeFrom, edgeAlpha)}, ${rgba(art.cardEdgeTo || art.cardEdgeFrom, edgeAlpha)} 58%, ${rgba(art.cardEdgeFrom, edgeAlpha)})`
      : "transparent";
    const themed = Boolean(art.viewActiveFrom);
    const viewFrom = art.viewActiveFrom || t.accentSoft;
    const viewTo = art.viewActiveTo || viewFrom;
    const viewBorder = art.viewActiveBorder || (themed ? viewFrom : rgba(t.accent, 135));
    const segFrom = art.segActiveFrom || t.primaryFrom;
    const segTo = art.segActiveTo || t.primaryTo;

    let glow;
    if (key === "dark") glow = `0 0 26px ${rgba(t.primaryFrom, 95)}`;
    else if (key === "light") glow = `0 4px 20px ${rgba(t.primaryFrom, 70)}`;
    else if (art.isLight) glow = `0 4px 20px ${rgba(t.primaryFrom, 64)}`;
    else glow = `0 0 24px ${rgba(t.primaryFrom, 82)}`;

    const shadow = t.shadowAlpha
      ? `0 5px 24px rgba(15, 40, 70, ${(t.shadowAlpha / 255 * 0.7).toFixed(3)})`
      : "none";

    const pickBg = art.pickFrom
      ? `linear-gradient(135deg, ${art.pickFrom}, ${art.pickTo || art.pickFrom})`
      : `color-mix(in srgb, ${t.surface} 92%, transparent)`;
    const pickHover = art.pickFrom
      ? `linear-gradient(135deg, ${art.pickHoverFrom || art.pickFrom}, ${art.pickHoverTo || art.pickTo || art.pickFrom})`
      : `color-mix(in srgb, ${t.surfaceAlt} 92%, transparent)`;

    const vars = {
      "--text": t.text, "--text-2": t.text2, "--muted": t.muted,
      "--surface": t.surface, "--surface-alt": t.surfaceAlt,
      "--border": t.border, "--border-strong": t.borderStrong,
      "--accent": t.accent, "--accent-hover": t.accentHover, "--accent-pressed": t.accentPressed,
      "--on-accent": t.onAccent, "--accent-soft": t.accentSoft, "--accent-soft-text": t.accentSoftText,
      "--field": t.field, "--field-focus": t.fieldFocus, "--field-border": t.fieldBorder,
      "--field-hover": art.fieldHover || t.borderStrong, "--placeholder": t.placeholder,
      "--primary-from": t.primaryFrom, "--primary-to": t.primaryTo,
      "--primary-hover-from": t.pHoverFrom, "--primary-hover-to": t.pHoverTo,
      "--primary-pressed-from": t.pPressFrom, "--primary-pressed-to": t.pPressTo,
      "--primary-text": art.primaryText || t.onAccent,
      "--ok-bg": t.okBg, "--ok-fg": t.okFg, "--err-bg": t.errBg, "--err-fg": t.errFg,
      "--warn-bg": t.warnBg, "--warn-fg": t.warnFg, "--info-bg": t.infoBg, "--info-fg": t.infoFg,
      "--chip-from": chipFrom, "--chip-to": chipTo, "--chip-fg": art.chipFg || t.onAccent,
      "--chip-radius": px(art.chipRadius),
      "--badge-bg": art.badgeBg || t.accentSoft, "--badge-fg": art.badgeFg || t.accentSoftText,
      "--badge-border": art.badgeBorder || "transparent",
      "--status-bg": rgba(art.statusBg || t.surfaceAlt, 190),
      "--status-border": art.statusBorder || t.border,
      "--status-fg": art.statusFg || t.text2,
      "--status-dot": art.statusDot || t.accent,
      "--view-from": viewFrom, "--view-to": viewTo,
      "--view-fg": art.viewActiveFg || t.accentSoftText, "--view-border": viewBorder,
      "--seg-from": segFrom, "--seg-to": segTo,
      "--seg-fg": art.segActiveFg || t.onAccent,
      "--seg-border": art.segActiveBorder || segFrom,
      "--tab-border": art.accentBorder || t.accent,
      "--card-bg": cardBg, "--card-border": t.border, "--card-edge": cardEdge,
      "--card-edge-h": px(art.cardEdgeHeight || 0), "--card-radius": px(art.cardRadius),
      "--field-radius": px(art.fieldRadius), "--card-shadow": shadow, "--btn-glow": glow,
      "--pick-bg": pickBg, "--pick-hover-bg": pickHover,
      "--pick-fg": art.pickFg || t.text2,
      "--pick-hover-fg": art.pickFg || t.accent,
      "--pick-border": art.pickBorder || t.border,
      "--bg-top": t.bgTop, "--bg-bottom": t.bgBottom,
      "--font-display": fontStack(art.displayFont), "--font-ui": fontStack(art.uiFont),
      "--font-mono": fontStack(art.monoFont),
      "--font-section": fontStack(art.sectionFont || art.uiFont),
      "--font-button": fontStack(art.buttonFont || art.uiFont),
      "--font-status": fontStack(art.statusFont || art.uiFont),
      "--meta-font": fontStack(art.metaFont || art.uiFont),
      "--badge-font": fontStack(art.badgeFont || art.uiFont),
      "--brand-size": px(art.brandSize), "--brand-track": em(art.brandTracking, art.brandSize),
      "--brand-transform": art.brandTransform, "--brand-dy": px(art.brandDy),
      "--brand-color": art.brandColor || t.text,
      "--section-size": px(art.sectionSize), "--section-track": em(art.sectionTracking, art.sectionSize),
      "--section-transform": art.sectionTransform,
      "--button-size": px(art.buttonSize), "--button-track": em(art.buttonTracking, art.buttonSize),
      "--button-transform": art.buttonTransform,
      "--status-size": px(art.statusSize), "--status-track": em(art.statusTracking, art.statusSize),
      "--status-transform": art.statusTransform,
      "--meta-track": px(+(art.metaTracking * 9).toFixed(2) || 1.1),
      "--meta-transform": art.metaTransform,
      "--badge-track": px(+(art.badgeTracking * 9).toFixed(2) || 0.36),
      "--badge-transform": art.badgeTransform,
      "--dialog-title-size": px(art.dialogTitleSize),
      "--suffix-color": art.brandSuffixColor || t.accent,
      "--suffix-style": art.brandSuffixStyle,
      "--suffix-size": px(art.brandSuffixSize || art.brandSize),
      "--suffix-bg": art.brandSuffixBg || "transparent",
    };
    return { t, art, vars };
  }

  /* ══════════════════════════════════════════════════════════════════════
     FUNDO — porte de StarField._paint_*
     ══════════════════════════════════════════════════════════════════════ */
  const images = new Map();
  function image(src) {
    if (!images.has(src)) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.onload = () => { if (needsImage(state.key, src)) paintBackdrop(); };
      images.set(src, img);
    }
    return images.get(src);
  }
  const ready = (img) => img && img.complete && img.naturalWidth > 0;
  function needsImage(key, src) {
    const cov = COVERS[key];
    if (cov && "assets/img/" + cov[0] === src) return true;
    if (key === "leila" && src.startsWith("assets/img/leila")) return true;
    return false;
  }

  function blob(ctx, cx, cy, rx, ry, color, alpha, stop = 0.7) {
    if (alpha <= 0 || rx <= 0 || ry <= 0) return;
    ctx.save();
    ctx.translate(cx, cy);
    if (Math.abs(rx - ry) > 0.5) ctx.scale(rx / ry, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(Math.min(0.999, stop), rgba(color, 0));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, ry, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function radial(ctx, cx, cy, r, color, alpha) {
    if (alpha <= 0 || r <= 0) return;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
  }
  const freeBand = () => [500, Math.max(500, H - 99)];
  const circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  const ellipse = (ctx, x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); };

  function paintAtmosphere(ctx, w, h, t) {
    if (!t.glowAlpha) return;
    const g = ctx.createRadialGradient(w * 0.84, h * 0.01, 0, w * 0.84, h * 0.01, Math.max(w, h) * 0.9);
    g.addColorStop(0, rgba(t.glow, t.glowAlpha));
    g.addColorStop(1, rgba(t.glow, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function paintClouds(ctx, w, h) {
    blob(ctx, w * 0.55, -h * 0.08, w * 0.85, h * 0.44, "#C9B6F2", 120, 0.85);
    blob(ctx, w * 0.68, h * 0.04, w * 0.25, h * 0.3125, "#F07BC0", 55, 0.80);
    blob(ctx, w * 0.02, h * 0.02, w * 0.422, h * 0.542, "#E23E9E", 135, 0.72);
    blob(ctx, w * 0.99, 0, w * 0.4375, h * 0.4896, "#8FA6F2", 170, 0.72);
    blob(ctx, w * 0.72, h * 0.98, w * 0.367, h * 0.4375, "#FFC96B", 108, 0.72);
    blob(ctx, w * 0.42, h * 0.30, w * 0.297, h * 0.229, "#FFFFFF", 70, 0.85);
    const rng = new PyRandom(7);
    const step = 118;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        for (let i = 0; i < 3; i++) {
          const pxx = x + rng.uniform(0, step);
          const pyy = y + rng.uniform(0, step);
          const a = rng.randint(70, 150);
          const raio = rng.uniform(0.5, 1.1);
          ctx.fillStyle = rgba("#FFFFFF", a);
          circle(ctx, pxx, pyy, raio);
        }
      }
    }
  }

  function paintGrain(ctx, w, h) {
    blob(ctx, w * 0.84, -h * 0.12, 560, 400, "#920703", 120, 0.68);
    blob(ctx, -w * 0.04, h * 0.24, 380, 280, "#920703", 41, 0.66);
    blob(ctx, w * 0.12, h * 1.12, 380, 260, "#FBE500", 13, 0.68);
    blob(ctx, w * 0.12, h * 0.08, w * 0.42, h * 0.42, "#920703", 85, 0.70);
    blob(ctx, w * 0.92, h * 0.74, w * 0.40, h * 0.40, "#920703", 58, 0.70);
    blob(ctx, w * 0.55, h * 1.10, w * 0.40, h * 0.35, "#FBE500", 20, 0.70);
    blob(ctx, -w * 0.20, -h * 0.25, 390, 310, "#920703", 70, 0.68);
    blob(ctx, w * 0.69, h * 0.75, 310, 260, "#920703", 50, 0.68);
    blob(ctx, w * 0.73, -h * 0.19, 230, 180, "#FBE500", 15, 0.70);

    ctx.save();
    ctx.translate(w - 120, 120);
    ctx.rotate((-6 * Math.PI) / 180);
    ctx.fillStyle = rgba("#920703", 33);
    ctx.beginPath();
    ctx.moveTo(320, 85);
    ctx.bezierCurveTo(268, 40, 166, 15, 12, 45);
    ctx.lineTo(64, 75); ctx.lineTo(26, 85); ctx.lineTo(90, 105); ctx.lineTo(51, 120);
    ctx.lineTo(141, 130); ctx.lineTo(115, 150); ctx.lineTo(218, 145); ctx.lineTo(230, 175);
    ctx.lineTo(320, 150); ctx.lineTo(410, 175); ctx.lineTo(422, 145); ctx.lineTo(525, 150);
    ctx.lineTo(499, 130); ctx.lineTo(589, 120); ctx.lineTo(550, 105); ctx.lineTo(614, 85);
    ctx.lineTo(576, 75); ctx.lineTo(628, 45);
    ctx.bezierCurveTo(474, 15, 372, 40, 320, 85);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = rgba("#FFFFFF", 7);
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const edge = ctx.createLinearGradient(0, 0, w, 0);
    edge.addColorStop(0, rgba("#920703", 140));
    edge.addColorStop(0.58, rgba("#FBE500", 140));
    edge.addColorStop(1, rgba("#920703", 140));
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, 2);
  }

  function paintPaper(ctx, w, h) {
    blob(ctx, w * 0.84, -h * 0.12, 450, 310, "#FFB1C1", 82, 0.68);
    blob(ctx, w * 0.12, h * 1.12, 380, 260, "#FFDAD9", 97, 0.68);
    blob(ctx, w * 0.20, h * 0.12, w * 0.45, h * 0.45, "#FFB1C1", 85, 0.70);
    blob(ctx, w * 0.86, h * 0.58, w * 0.42, h * 0.42, "#C81D3B", 26, 0.70);
    blob(ctx, w * 0.30, h * 0.96, w * 0.45, h * 0.40, "#FFDAD9", 95, 0.70);
    blob(ctx, w * 0.50, -h * 0.05, w * 0.95, h * 0.40, "#C9A8A8", 75, 0.85);
    blob(ctx, -w * 0.19, -h * 0.23, 340, 270, "#FFB1C1", 107, 0.68);
    blob(ctx, w * 1.00, h * 0.62, w * 0.42, h * 0.42, "#C81D3B", 26, 0.78);
    blob(ctx, w * 0.44, h * 0.31, 210, 190, "#FFDAD9", 112, 0.70);

    // grão de papel: tile de 6 px repetido
    const tile = document.createElement("canvas");
    tile.width = 6; tile.height = 6;
    const tp = tile.getContext("2d");
    tp.fillStyle = rgba("#5B4040", 20);
    tp.beginPath(); tp.arc(3, 3, 0.6, 0, TAU); tp.fill();
    const pat = ctx.createPattern(tile, "repeat");
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, w, h);

    // disco de vinil
    const cx = w * 0.906, cy = h * 0.50, outer = w * 0.226;
    ctx.strokeStyle = rgba("#A10028", 18);
    ctx.lineWidth = 1;
    for (let r = 22; r < outer; r += 6) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = rgba("#A10028", 42);
    ctx.beginPath(); ctx.arc(cx, cy, outer, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba("#A10028", 40);
    ctx.beginPath(); ctx.arc(cx, cy, outer * 0.252, 0, TAU); ctx.stroke();
    ctx.fillStyle = rgba("#A10028", 10);
    circle(ctx, cx, cy, outer * 0.252);
  }

  function paintDotgrid(ctx, w, h) {
    blob(ctx, w * 0.84, -h * 0.12, 450, 310, "#7E22CE", 102, 0.68);
    blob(ctx, -w * 0.04, h * 0.24, 380, 280, "#F59E0B", 23, 0.66);
    blob(ctx, w * 0.12, h * 1.12, 380, 260, "#581C87", 77, 0.68);
    blob(ctx, w * 0.12, h * 0.10, w * 0.45, h * 0.45, "#7E22CE", 78, 0.70);
    blob(ctx, w * 0.96, h * 0.12, w * 0.40, h * 0.40, "#F59E0B", 10, 0.70);
    blob(ctx, w * 0.62, h * 1.08, w * 0.45, h * 0.40, "#581C87", 95, 0.70);
    blob(ctx, -w * 0.20, -h * 0.25, 380, 300, "#7E22CE", 107, 0.68);
    blob(ctx, w * 0.70, h * 0.02, 260, 260, "#F59E0B", 36, 0.68);
    blob(ctx, w * 0.07, h * 0.77, 310, 260, "#581C87", 55, 0.68);

    ctx.fillStyle = rgba("#D8B4FE", 36);
    for (let y = 13; y < h; y += 26) {
      for (let x = 13; x < w; x += 26) circle(ctx, x, y, 0.55);
    }
    const cx = w * 0.902, cy = h * 0.353;
    ctx.strokeStyle = rgba("#F59E0B", 46);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.184, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba("#C084FC", 23);
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.129, 0, TAU); ctx.stroke();
  }

  function paintVaporwave(ctx, w, h, t) {
    const rosa = t.glow, ciano = t.accent, laranja = t.primaryTo, pessego = t.text2;
    blob(ctx, w * 0.82, -h * 0.10, w * 0.46, h * 0.40, rosa, 40, 0.72);
    blob(ctx, w * 0.03, h * 0.52, w * 0.38, h * 0.38, ciano, 12, 0.72);
    blob(ctx, w * 0.58, h * 1.08, w * 0.60, h * 0.28, laranja, 14, 0.75);

    const cx = w * 0.82, cy = h * 0.165, raio = Math.min(w, h) * 0.215;
    const disco = ctx.createRadialGradient(cx, cy, 0, cx, cy, raio);
    disco.addColorStop(0, rgba(rosa, 26));
    disco.addColorStop(0.58, rgba(laranja, 15));
    disco.addColorStop(1, rgba(ciano, 0));
    ctx.fillStyle = disco;
    ctx.beginPath(); ctx.ellipse(cx, cy, raio, raio * 1.02, 0, 0, TAU); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, raio, raio * 1.02, 0, 0, TAU); ctx.clip();
    let idx = 0;
    for (let y = cy - raio; y < cy + raio; y += 8) {
      ctx.strokeStyle = rgba(pessego, idx % 3 ? 22 : 34);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - raio, y); ctx.lineTo(cx + raio, y); ctx.stroke();
      idx++;
    }
    ctx.restore();

    ctx.lineWidth = 1;
    [[0.30, 36], [0.52, 30], [0.74, 26], [0.98, 34]].forEach(([frac, alpha]) => {
      ctx.strokeStyle = rgba(rosa, alpha);
      ctx.beginPath(); ctx.ellipse(cx, cy, raio * frac, raio * frac * 1.02, 0, 0, TAU); ctx.stroke();
    });

    const horizonte = h * 0.78;
    ctx.strokeStyle = rgba(ciano, 12);
    for (let i = -14; i <= 14; i++) {
      const xb = w * 0.5 + i * (w / 13.0);
      ctx.beginPath(); ctx.moveTo(w * 0.5, horizonte); ctx.lineTo(xb, h); ctx.stroke();
    }
    ctx.strokeStyle = rgba(rosa, 10);
    for (let i = 1; i <= 16; i++) {
      const tt = i / 16.0;
      const y = horizonte + (h - horizonte) * Math.pow(tt, 1.75);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = rgba(pessego, 26);
    ctx.beginPath(); ctx.moveTo(0, horizonte); ctx.lineTo(w, horizonte); ctx.stroke();

    const rng = new PyRandom(1984);
    const cores = [pessego, t.infoFg, t.accentHover, t.text];
    for (let i = 0; i < 110; i++) {
      const x = rng.uniform(0.01, 0.99) * w;
      const y = rng.uniform(0.01, 0.76) * h;
      const r = rng.uniform(0.45, 1.5);
      ctx.fillStyle = rgba(rng.choice(cores), rng.randint(32, 135));
      circle(ctx, x, y, r);
    }

    const pontos = [[0.06, 0.12], [0.13, 0.08], [0.17, 0.16], [0.24, 0.13]];
    ctx.strokeStyle = rgba(pessego, 28);
    for (let i = 1; i < pontos.length; i++) {
      ctx.beginPath();
      ctx.moveTo(pontos[i - 1][0] * w, pontos[i - 1][1] * h);
      ctx.lineTo(pontos[i][0] * w, pontos[i][1] * h);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(pessego, 110);
    pontos.forEach(([x, y]) => circle(ctx, x * w, y * h, 1.4));

    ctx.strokeStyle = rgba(t.text, 3);
    for (let y = 0; y < h; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  function paintTerminal(ctx, w, h, t) {
    const verde = t.accent, fosforo = t.accentHover, ambar = t.warnFg;
    blob(ctx, w * 0.86, -h * 0.08, w * 0.44, h * 0.36, verde, 26, 0.72);
    blob(ctx, w * 0.04, h * 1.06, w * 0.42, h * 0.24, verde, 14, 0.75);

    ctx.strokeStyle = rgba(verde, 9);
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 34) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const [topo, base] = freeBand();
    const faixa = base - topo;
    let cx, cy, raio;
    if (faixa >= 140) {
      cx = w * 0.70; cy = topo + faixa * 0.52;
      raio = Math.min(0.28 * Math.min(w, h), faixa * 0.92);
    } else { cx = -1e4; cy = -1e4; raio = 1; }

    [[1.00, 24], [0.72, 18], [0.46, 14], [0.22, 11]].forEach(([frac, alpha]) => {
      ctx.strokeStyle = rgba(verde, alpha);
      ctx.beginPath(); ctx.arc(cx, cy, raio * frac, 0, TAU); ctx.stroke();
    });
    ctx.strokeStyle = rgba(verde, 26);
    for (let i = 0; i < 360; i += 15) {
      const ang = (i * Math.PI) / 180;
      const r1 = raio * 0.94, r2 = raio * (i % 45 === 0 ? 1.025 : 0.985);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(verde, 13);
    ctx.beginPath(); ctx.moveTo(cx - raio * 1.07, cy); ctx.lineTo(cx + raio * 1.07, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - raio * 1.07); ctx.lineTo(cx, cy + raio * 1.07); ctx.stroke();

    ctx.strokeStyle = rgba(fosforo, 22);
    ctx.beginPath();
    ctx.arc(cx, cy, raio, (24 * Math.PI) / 180, ((24 + 64) * Math.PI) / 180);
    ctx.stroke();

    [[38, 0.74], [126, 0.46], [214, 0.86], [322, 0.58]].forEach(([ang, dist]) => {
      const a = (ang * Math.PI) / 180;
      ctx.fillStyle = rgba(ambar, 30);
      circle(ctx, cx + Math.cos(a) * raio * dist, cy + Math.sin(a) * raio * dist, 2);
    });

    // rosto alienígena
    const s = raio * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.92);
    ctx.bezierCurveTo(cx + s * 0.52, cy - s * 0.92, cx + s * 0.76, cy - s * 0.38, cx + s * 0.58, cy + s * 0.04);
    ctx.bezierCurveTo(cx + s * 0.46, cy + s * 0.40, cx + s * 0.26, cy + s * 0.74, cx, cy + s * 0.96);
    ctx.bezierCurveTo(cx - s * 0.26, cy + s * 0.74, cx - s * 0.46, cy + s * 0.40, cx - s * 0.58, cy + s * 0.04);
    ctx.bezierCurveTo(cx - s * 0.76, cy - s * 0.38, cx - s * 0.52, cy - s * 0.92, cx, cy - s * 0.92);
    ctx.closePath();
    ctx.fillStyle = rgba(verde, 7);
    ctx.fill();
    ctx.strokeStyle = rgba(verde, 32);
    ctx.stroke();

    [-1, 1].forEach((lado) => {
      ctx.save();
      ctx.translate(cx + lado * s * 0.27, cy - s * 0.10);
      ctx.rotate(((18 * lado) * Math.PI) / 180);
      ctx.fillStyle = rgba(t.bgBottom, 200);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.20, s * 0.09, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = rgba(verde, 34);
      ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle = rgba(t.bgBottom, 180);
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.50, s * 0.24, s * 0.08, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(verde, 28); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.20, cy + s * 0.47);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(cx - s * 0.20 + i * s * 0.08, cy + s * (0.47 + (i % 2 ? 0.045 : 0)));
    }
    ctx.strokeStyle = rgba(verde, 30);
    ctx.stroke();

    ctx.strokeStyle = rgba(verde, 20);
    [-1, 1].forEach((lado) => {
      for (let i = 0; i < 3; i++) {
        const x0 = cx + lado * s * (0.52 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(x0, cy - s * 0.10);
        ctx.bezierCurveTo(x0 + lado * s * 0.10, cy + s * 0.10, x0 - lado * s * 0.05, cy + s * 0.35, x0 - lado * s * 0.10, cy + s * 0.56);
        ctx.stroke();
      }
    });

    ctx.strokeStyle = rgba(t.text, 4);
    for (let y = 0; y < h; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const vin = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.72);
    vin.addColorStop(0.55, rgba(t.bgBottom, 0));
    vin.addColorStop(1, rgba(t.bgBottom, 120));
    ctx.fillStyle = vin;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = rgba(ambar, 30);
    const tam = 14;
    [[24, 24, 1, 1], [w - 24, 24, -1, 1], [24, h - 24, 1, -1], [w - 24, h - 24, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * tam, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * tam); ctx.stroke();
    });
  }

  function paintHalftone(ctx, w, h, t) {
    const amarelo = t.primaryFrom, azul = t.accent, vermelho = t.errFg;
    [[0.00, 16], [0.07, 8]].forEach(([desloc, alpha]) => {
      ctx.fillStyle = rgba(amarelo, alpha);
      ctx.beginPath();
      ctx.moveTo(w * (0.54 + desloc), 0);
      ctx.lineTo(w * (0.76 + desloc), 0);
      ctx.lineTo(w * (0.36 + desloc), h * 0.46);
      ctx.lineTo(w * (0.14 + desloc), h * 0.46);
      ctx.closePath();
      ctx.fill();
    });

    const passo = 10;
    let linha = 0;
    for (let y = passo / 2; y < h; y += passo) {
      let col = 0;
      for (let x = passo / 2 + (linha % 2 ? passo / 2 : 0); x < w; x += passo) {
        const d1 = Math.hypot((x - w * 0.96) / (w * 0.55), (y - h * 0.06) / (h * 0.55));
        const d2 = Math.hypot((x - w * 0.04) / (w * 0.48), (y - h * 0.98) / (h * 0.48));
        const tt = Math.max(0, 1 - Math.min(d1, d2));
        const alpha = Math.trunc(38 * tt * tt);
        if (alpha >= 6) {
          const cor = (linha + Math.trunc(x / passo)) % 3 ? azul : vermelho;
          ctx.fillStyle = rgba(cor, alpha);
          circle(ctx, x, y, 0.7 + 1.2 * tt);
        }
        col++;
      }
      linha++;
    }

    ctx.strokeStyle = rgba(azul, 16);
    for (let i = 0; i < 5; i++) {
      const off = w * 0.022 * i;
      ctx.beginPath();
      ctx.moveTo(w * 0.60 + off, h * 0.10);
      ctx.lineTo(w * 0.98 + off, h * 0.34 - i * h * 0.018);
      ctx.stroke();
    }
  }

  function sunflower(ctx, cx, cy, raio, petala, centro, caule, fillAlpha, lineAlpha, stemEnd) {
    ctx.save();
    ctx.strokeStyle = rgba(caule, lineAlpha);
    ctx.lineWidth = Math.max(1, raio * 0.06);
    ctx.beginPath(); ctx.moveTo(cx, cy + raio * 0.54); ctx.lineTo(cx, stemEnd); ctx.stroke();
    ctx.translate(cx, cy);
    for (let i = 0; i < 16; i++) {
      ctx.save();
      ctx.rotate((i * (360 / 16) * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, -raio * 0.34);
      ctx.bezierCurveTo(raio * 0.26, -raio * 0.64, raio * 0.22, -raio * 1.16, 0, -raio * 1.30);
      ctx.bezierCurveTo(-raio * 0.22, -raio * 1.16, -raio * 0.26, -raio * 0.64, 0, -raio * 0.34);
      ctx.strokeStyle = rgba(petala, lineAlpha);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = rgba(petala, fillAlpha);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = rgba(centro, Math.min(255, lineAlpha + 42));
    ctx.lineWidth = 1.2;
    ctx.fillStyle = rgba(centro, fillAlpha + 10);
    ctx.beginPath(); ctx.arc(0, 0, raio * 0.52, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba(centro, Math.min(255, lineAlpha + 24));
    for (let i = 0; i < 22; i++) {
      const ang = (i * 137.5 * Math.PI) / 180;
      const dist = raio * 0.44 * Math.sqrt(i / 22);
      circle(ctx, Math.cos(ang) * dist, Math.sin(ang) * dist, 0.8);
    }
    ctx.restore();
  }

  function paintSunflower(ctx, w, h, t) {
    const ambar = t.primaryFrom, laranja = t.primaryTo, verde = t.accent, castanho = t.text;
    blob(ctx, w * 0.84, h * 0.08, w * 0.38, h * 0.34, ambar, 34, 0.72);
    blob(ctx, w * 0.10, h * 0.94, w * 0.44, h * 0.28, verde, 15, 0.75);

    const cx = w * 0.84, cy = h * 0.26, raio = Math.min(w, h) * 0.12;
    ctx.fillStyle = rgba(ambar, 20);
    circle(ctx, cx, cy, raio);
    [[1.00, 26], [0.82, 20], [0.64, 16]].forEach(([frac, alpha]) => {
      ctx.strokeStyle = rgba(laranja, alpha);
      ctx.beginPath(); ctx.arc(cx, cy, raio * frac, 0, TAU); ctx.stroke();
    });
    ctx.strokeStyle = rgba(ambar, 20);
    for (let i = 0; i < 24; i++) {
      const ang = (i * 15 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * raio * 1.07, cy + Math.sin(ang) * raio * 1.07);
      ctx.lineTo(cx + Math.cos(ang) * raio * 1.16, cy + Math.sin(ang) * raio * 1.16);
      ctx.stroke();
    }

    ctx.fillStyle = rgba(verde, 13);
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(0, h * 0.80);
    ctx.bezierCurveTo(w * 0.18, h * 0.72, w * 0.33, h * 0.86, w * 0.52, h * 0.81);
    ctx.bezierCurveTo(w * 0.70, h * 0.76, w * 0.84, h * 0.68, w, h * 0.74);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(verde, 10);
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(0, h * 0.88);
    ctx.bezierCurveTo(w * 0.22, h * 0.82, w * 0.46, h * 0.92, w * 0.66, h * 0.86);
    ctx.bezierCurveTo(w * 0.80, h * 0.82, w * 0.92, h * 0.80, w, h * 0.84);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    const [topo, base] = freeBand();
    const faixa = base - topo;
    if (faixa >= 140) {
      const stemEnd = base + 26;
      const fy = topo + faixa * 0.52;
      const fr = Math.min(Math.min(w, h) * 0.105, faixa * 0.36);
      sunflower(ctx, w * 0.79, fy, fr, ambar, castanho, verde, 10, 26, stemEnd);
      const fyMenor = topo + faixa * 0.78;
      [[0.10, 0.036, 16, 32], [0.24, 0.028, 14, 28], [0.38, 0.032, 14, 30], [0.93, 0.030, 14, 28]]
        .forEach(([fx, frf, fa, fl]) => sunflower(ctx, w * fx, fyMenor, Math.min(w, h) * frf, ambar, castanho, verde, fa, fl, stemEnd));
    }

    const rng = new PyRandom(2017);
    for (let i = 0; i < 64; i++) {
      const x = rng.uniform(0.02, 0.98) * w;
      const y = rng.uniform(0.05, 0.92) * h;
      const r = rng.uniform(0.6, 1.5);
      ctx.fillStyle = rgba(rng.random() < 0.68 ? ambar : verde, rng.randint(28, 72));
      circle(ctx, x, y, r);
    }
  }

  function paintSnowBackdrop(ctx, w, h, t) {
    const verde = t.accent, vermelho = t.primaryFrom, dourado = t.primaryTo;
    blob(ctx, w * 0.86, -h * 0.08, w * 0.42, h * 0.36, verde, 22, 0.72);
    blob(ctx, w * 0.02, h * 0.96, w * 0.42, h * 0.26, vermelho, 10, 0.75);
    blob(ctx, w * 0.52, h * 1.06, w * 0.48, h * 0.22, dourado, 14, 0.75);
    const cx = w * 0.90, cy = h * 0.19, raio = Math.min(w, h) * 0.12;
    [[1.00, 20], [0.66, 16], [0.34, 12]].forEach(([frac, alpha]) => {
      ctx.strokeStyle = rgba(dourado, alpha);
      ctx.beginPath(); ctx.arc(cx, cy, raio * frac, 0, TAU); ctx.stroke();
    });
    ctx.strokeStyle = rgba(dourado, 30);
    for (let i = 0; i < 12; i++) {
      const ang = (i * 30 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * raio * 1.02, cy + Math.sin(ang) * raio * 1.02);
      ctx.lineTo(cx + Math.cos(ang) * raio * 1.16, cy + Math.sin(ang) * raio * 1.16);
      ctx.stroke();
    }
  }

  function heart(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.78);
    ctx.bezierCurveTo(cx - r * 1.45, cy - r * 0.18, cx - r * 0.55, cy - r * 1.12, cx, cy - r * 0.32);
    ctx.bezierCurveTo(cx + r * 0.55, cy - r * 1.12, cx + r * 1.45, cy - r * 0.18, cx, cy + r * 0.78);
    ctx.fill();
  }
  function paw(ctx, cx, cy, r, color, angle = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, r * 0.28, r * 0.62, r * 0.52, 0, 0, TAU); ctx.fill();
    [[-0.52, -0.34, 0.20, 0.26], [-0.18, -0.62, 0.20, 0.26], [0.18, -0.62, 0.20, 0.26], [0.52, -0.34, 0.20, 0.26]]
      .forEach(([dx, dy, rx, ry]) => {
        ctx.beginPath(); ctx.ellipse(dx * r, dy * r, rx * r, ry * r, 0, 0, TAU); ctx.fill();
      });
    ctx.restore();
  }

  function paintLeila(ctx, w, h) {
    blob(ctx, w * 0.92, -h * 0.04, w * 0.46, h * 0.40, "#D7E4FF", 120, 0.78);
    blob(ctx, w * 0.03, h * 1.02, w * 0.38, h * 0.26, "#FFE3C4", 42, 0.76);
    blob(ctx, w * 0.24, -h * 0.10, w * 0.40, h * 0.30, "#FFE0EC", 30, 0.76);

    ctx.strokeStyle = rgba("#B9C8E8", 16);
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 56) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 56) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const cx = w * 0.90, cy = -h * 0.02, raio = Math.min(w, h);
    ctx.strokeStyle = rgba("#C9D8F6", 26);
    for (let i = 0; i < 18; i++) {
      const ang = ((18 + i * 8) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * raio * 0.08, cy + Math.sin(ang) * raio * 0.08);
      ctx.lineTo(cx + Math.cos(ang) * raio * 0.46, cy + Math.sin(ang) * raio * 0.46);
      ctx.stroke();
    }

    const [topo, base] = freeBand();
    const faixa = base - topo;
    if (faixa < 110 || state.tab !== 0) return;

    [[0.700, 0.16, 0.009, 54], [0.750, 0.28, 0.007, 40], [0.800, 0.10, 0.008, 46],
      [0.660, 0.42, 0.010, 52], [0.720, 0.50, 0.006, 30]]
      .forEach(([fx, fy, fr, alpha]) => heart(ctx, w * fx, topo + faixa * fy, Math.min(w, h) * fr, rgba("#B74082", alpha)));
    [[0.300, 0.22, 0.013, -18, 44], [0.480, 0.38, 0.010, 12, 34],
      [0.640, 0.24, 0.011, -8, 38], [0.180, 0.52, 0.009, 20, 30]]
      .forEach(([fx, fy, fr, ang, alpha]) => paw(ctx, w * fx, topo + faixa * fy, Math.min(w, h) * fr, rgba("#855300", alpha), ang));

    leilaPhoto(ctx, w, h, "leila-caramelo.png", "right", Math.min(faixa * 0.99, w * 0.33), 1.0);
    leilaPhoto(ctx, w, h, "leila.png", "left", Math.min(faixa * 0.54, w * 0.17), 0.34);
  }

  function leilaPhoto(ctx, w, h, filename, side, altura, opacidade) {
    const img = image("assets/img/" + filename);
    if (!ready(img)) return;
    const largura = (altura * img.naturalWidth) / Math.max(1, img.naturalHeight);
    const x = side === "left" ? 30 : w - largura - 30;
    const [, base] = freeBand();
    const y = base - altura;

    const halo = ctx.createRadialGradient(x + largura / 2, y + altura * 0.58, 0,
      x + largura / 2, y + altura * 0.58, Math.max(largura, altura) * 0.66);
    halo.addColorStop(0, rgba("#FFFFFF", 130));
    halo.addColorStop(1, rgba("#FFFFFF", 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x + largura / 2, y + altura * 0.58, Math.max(largura, altura) * 0.66, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = opacidade;
    ctx.drawImage(img, x, y, largura, altura);
    ctx.restore();
  }

  function paintCover(ctx, key, t) {
    const spec = COVERS[key];
    if (!spec) return;
    const [filename, baseSize, opacity] = spec;
    const img = image("assets/img/" + filename);
    if (!ready(img)) return;
    const size = Math.min(baseSize, W * (baseSize / 1280));
    if (size < 100) return;

    const rs = renderScale();
    const layer = document.createElement("canvas");
    layer.width = Math.round(size * rs);
    layer.height = Math.round(size * rs);
    const lp = layer.getContext("2d");
    lp.setTransform(rs, 0, 0, rs, 0, 0);

    lp.globalAlpha = opacity;
    lp.drawImage(img, 0, 0, size, size);
    lp.globalAlpha = 1;
    lp.globalCompositeOperation = "destination-in";
    let g = lp.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0.00, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,0.9216)");
    g.addColorStop(0.82, "rgba(255,255,255,0.4706)");
    g.addColorStop(1.00, "rgba(255,255,255,0)");
    lp.fillStyle = g;
    lp.fillRect(0, 0, size, size);
    g = lp.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0.00, "rgba(255,255,255,0)");
    g.addColorStop(0.28, "rgba(255,255,255,0.8235)");
    g.addColorStop(0.93, "rgba(255,255,255,1)");
    g.addColorStop(1.00, "rgba(255,255,255,0)");
    lp.fillStyle = g;
    lp.fillRect(0, 0, size, size);

    ctx.drawImage(layer, 0, 0, layer.width, layer.height, W - 20 - size, 44, size, size);
  }

  /* ── estrelas e neve ─────────────────────────────────────────────────── */
  function makeStars() {
    const rng = new PyRandom(20261104);
    const palette = ["#6FA8F0", "#8FC2FF", "#5B8FC9", "#A9CCFF", "#4E7FB8"];
    const out = [];
    for (let i = 0; i < 62; i++) {
      out.push({
        x: rng.uniform(0.015, 0.985), y: rng.uniform(0.01, 0.99),
        radius: rng.uniform(0.8, 1.7), baseAlpha: rng.randint(70, 205),
        period: rng.uniform(2.8, 8.4), phase: rng.random(),
        color: rng.choice(palette), halo: false,
      });
    }
    for (let i = 0; i < 5; i++) {
      out.push({
        x: rng.uniform(0.10, 0.90), y: rng.uniform(0.07, 0.92),
        radius: rng.uniform(1.5, 2.0), baseAlpha: rng.randint(170, 220),
        period: rng.uniform(4.5, 9.5), phase: rng.random(),
        color: "#9CC7FF", halo: true,
      });
    }
    return out;
  }
  function makeSnow() {
    const rng = new PyRandom(20261225);
    const tones = ["gold", "gold", "gold", "green", "green", "red"];
    const out = [];
    for (let i = 0; i < 12; i++) {
      out.push({
        x: rng.uniform(0.03, 0.97), y: rng.uniform(0.04, 0.96),
        radius: rng.uniform(3.6, 6.2), baseAlpha: rng.randint(130, 200),
        period: rng.uniform(4.5, 10.0), phase: rng.random(),
        halo: true, shape: "flake", glow: rng.uniform(3.6, 4.8), tone: rng.choice(tones),
      });
    }
    for (let i = 0; i < 4; i++) {
      out.push({
        x: rng.uniform(0.04, 0.96), y: rng.uniform(0.05, 0.95),
        radius: rng.uniform(4.2, 6.4), baseAlpha: rng.randint(110, 165),
        period: rng.uniform(3.8, 8.5), phase: rng.random(),
        halo: true, shape: "orb", glow: rng.uniform(4.0, 5.0), tone: rng.choice(["gold", "red"]),
      });
    }
    return out;
  }

  const STARS = makeStars();
  const SNOW = makeSnow();
  const sky = $("#sky");
  const particles = $("#particles");
  const sctx = sky.getContext("2d");
  const pctx = particles.getContext("2d");
  let canvasRs = 0;
  const renderScale = () => state.scale * Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas(canvas, ctx) {
    const rs = renderScale();
    canvas.width = Math.round(W * rs);
    canvas.height = Math.round(H * rs);
    ctx.setTransform(rs, 0, 0, rs, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  function paintBackdrop() {
    const { t, art } = resolveTheme(state.key);
    sizeCanvas(sky, sctx);
    sctx.setTransform(renderScale(), 0, 0, renderScale(), 0, 0);
    const g = sctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(t.bgTop));
    g.addColorStop(1, rgba(t.bgBottom));
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, W, H);

    const pattern = art.pattern || (t.stars ? "stars" : "plain");
    switch (pattern) {
      case "clouds": paintClouds(sctx, W, H); break;
      case "grain": paintGrain(sctx, W, H); break;
      case "paper": paintPaper(sctx, W, H); break;
      case "dotgrid": paintDotgrid(sctx, W, H); break;
      case "vaporwave": paintVaporwave(sctx, W, H, t); break;
      case "terminal": paintTerminal(sctx, W, H, t); break;
      case "halftone": paintHalftone(sctx, W, H, t); break;
      case "sunflower": paintSunflower(sctx, W, H, t); break;
      case "snow": paintSnowBackdrop(sctx, W, H, t); break;
      case "leila": paintLeila(sctx, W, H); break;
      default: paintAtmosphere(sctx, W, H, t);
    }
    paintCover(sctx, state.key, t);
    paintParticles(true);
  }

  function paintParticles(staticFrame = false) {
    const { t, art } = resolveTheme(state.key);
    const rs = renderScale();
    if (canvasRs !== rs) {
      sizeCanvas(particles, pctx);
      canvasRs = rs;
    }
    pctx.clearRect(0, 0, W, H);
    const now = staticFrame || state.reduced ? 0 : performance.now() / 1000;

    if (art.pattern === "snow") {
      const cores = { gold: t.primaryTo, green: t.accent, red: t.primaryFrom };
      SNOW.forEach((p) => {
        let alpha, raio;
        if (state.reduced) {
          alpha = Math.trunc(p.baseAlpha * 0.85);
          raio = p.radius * 0.95;
        } else {
          let wave = 0.5 + 0.5 * Math.sin(TAU * (now / p.period + p.phase));
          wave = wave * wave * (3 - 2 * wave);
          if (wave <= 0.30) return;
          let visivel = (wave - 0.30) / 0.70;
          visivel = visivel * visivel * (3 - 2 * visivel);
          alpha = Math.trunc(p.baseAlpha * (0.15 + 0.85 * visivel));
          raio = p.radius * (0.78 + 0.34 * visivel);
        }
        if (alpha <= 4) return;
        const nome = cores[p.tone] || t.primaryTo;
        const cx = p.x * W, cy = p.y * H;
        const haloR = raio * p.glow;
        const halo = pctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
        halo.addColorStop(0, rgba(nome, Math.trunc(alpha * 0.34)));
        halo.addColorStop(0.45, rgba(nome, Math.trunc(alpha * 0.12)));
        halo.addColorStop(1, rgba(nome, 0));
        pctx.fillStyle = halo;
        circle(pctx, cx, cy, haloR);

        if (p.shape === "flake") {
          pctx.strokeStyle = rgba(nome, alpha);
          pctx.lineWidth = Math.max(0.8, raio * 0.20);
          pctx.lineCap = "round";
          [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((ang) => {
            const dx = Math.cos(ang) * raio, dy = Math.sin(ang) * raio;
            pctx.beginPath(); pctx.moveTo(cx - dx, cy - dy); pctx.lineTo(cx + dx, cy + dy); pctx.stroke();
          });
          pctx.fillStyle = rgba(nome, alpha);
          circle(pctx, cx, cy, Math.max(0.6, raio * 0.16));
        } else {
          pctx.fillStyle = rgba(nome, alpha);
          circle(pctx, cx, cy, raio);
          pctx.fillStyle = rgba("#FFFFFF", Math.trunc(alpha * 0.55));
          circle(pctx, cx, cy, raio * 0.38);
        }
      });
      return;
    }

    if (!t.stars) return;
    STARS.forEach((s) => {
      let wave = 0.5 + 0.5 * Math.sin(TAU * (now / s.period + s.phase));
      wave = wave * wave * (3 - 2 * wave);
      const alpha = Math.trunc(s.baseAlpha * (0.35 + 0.65 * wave));
      if (alpha <= 3) return;
      const radius = s.radius * (0.68 + 0.62 * wave);
      const cx = s.x * W, cy = s.y * H;
      pctx.fillStyle = rgba(s.color, alpha);
      circle(pctx, cx, cy, radius);
      if (s.halo) {
        const hr = radius * 4.2;
        const halo = pctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
        halo.addColorStop(0, rgba(s.color, Math.trunc(alpha * 0.26)));
        halo.addColorStop(1, rgba(s.color, 0));
        pctx.fillStyle = halo;
        circle(pctx, cx, cy, hr);
      }
    });
  }

  /* ── laço de animação (25 fps, como o QTimer de 40 ms) ───────────────── */
  let last = 0;
  let rafId = 0;
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (state.reduced) return;
    if (document.hidden) return;
    if (ts - last < 40) return;
    last = ts;
    const { t, art } = resolveTheme(state.key);
    if (!t.stars && art.pattern !== "snow") return;
    paintParticles(false);
  }

  /* ── dissolução do fundo ao trocar de tema (QPropertyAnimation 260 ms) ── */
  const veil = $("#veil");
  const vctx = veil.getContext("2d");

  function captureComposite() {
    const snap = document.createElement("canvas");
    snap.width = sky.width; snap.height = sky.height;
    const sc = snap.getContext("2d");
    sc.drawImage(sky, 0, 0);
    sc.drawImage(particles, 0, 0);
    return snap;
  }
  function fadeVeil(snap) {
    if (state.reduced) return;
    veil.width = snap.width;
    veil.height = snap.height;
    vctx.setTransform(1, 0, 0, 1, 0, 0);
    vctx.clearRect(0, 0, veil.width, veil.height);
    vctx.drawImage(snap, 0, 0);
    veil.style.transition = "none";
    veil.style.opacity = "1";
    veil.getBoundingClientRect();
    requestAnimationFrame(() => {
      veil.style.transition = "opacity 260ms cubic-bezier(0.33, 1, 0.68, 1)";
      veil.style.opacity = "0";
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     APLICAÇÃO DO TEMA NO DOM
     ══════════════════════════════════════════════════════════════════════ */
  const app = $("#app");
  const brandTitle = $("#brandTitle");
  const brandSub = $("#brandSub");
  const brandLogo = $("#brandLogo");
  const toggle = $("#themeToggle");

  /* ── emoji do logo ──────────────────────────────────────────────────────
     O app pinta o emoji com draw_logo_emoji(): mede a tinta real do glifo,
     escala até 90% do miolo do tile e centraliza pela tinta. Fazer isso no
     canvas evita as duas falhas do texto solto: o avanço do glifo estoura o
     tile de 30px e a caixa de linha não centraliza igual em todos os emojis. */
  const EMOJI_FAMILY = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  const EMOJI_BASE = 100;
  const EMOJI_INK = new Map();

  function emojiInk(glyph) {
    let ink = EMOJI_INK.get(glyph);
    if (!ink) {
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `${EMOJI_BASE}px ${EMOJI_FAMILY}`;
      const m = ctx.measureText(glyph);
      ink = {
        w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
      };
      EMOJI_INK.set(glyph, ink);
    }
    return ink;
  }

  function drawLogoEmoji(canvas, glyph, inset) {
    const box = 30;
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = Math.round(box * dpr);
    canvas.height = Math.round(box * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const inner = box - inset * 2;
    const alvo = inner * 0.9;
    const base = emojiInk(glyph);
    const size = (EMOJI_BASE * alvo) / Math.max(base.w, base.h, 1);
    ctx.font = `${size.toFixed(2)}px ${EMOJI_FAMILY}`;
    const m = ctx.measureText(glyph);
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    ctx.fillText(
      glyph,
      inset + inner / 2 - w / 2 + m.actualBoundingBoxLeft,
      inset + inner / 2 - h / 2 + m.actualBoundingBoxAscent,
    );
  }

  function applyTheme(key, { animate = true } = {}) {
    let snapshot = null;
    if (animate && key !== state.key) snapshot = captureComposite();
    state.key = key;
    const { t, art, vars } = resolveTheme(key);
    app.dataset.theme = key;
    Object.entries(vars).forEach(([k, v]) => app.style.setProperty(k, v));

    // marca
    brandTitle.innerHTML = brandHTML(art);
    brandSub.textContent = art.brandSub || "Consolidação de pagamentos SAP";
    brandLogo.className = "brand__logo";
    brandLogo.innerHTML = "";
    if (art.logoIcon) {
      const img = document.createElement("img");
      img.src = art.logoIcon;
      img.alt = "";
      brandLogo.appendChild(img);
      if (!art.isLight) brandLogo.classList.add("brand__logo--ring");
    } else if (art.logoEmoji) {
      const canvas = document.createElement("canvas");
      canvas.className = "brand__emoji";
      canvas.setAttribute("aria-hidden", "true");
      let inset = 0;
      if (art.logoTile) {
        brandLogo.classList.add("brand__logo--tile");
        if (art.logoShape === "circle") brandLogo.classList.add("brand__logo--circle");
        brandLogo.style.setProperty("--logo-tile", art.logoTile);
        brandLogo.style.setProperty("--logo-border", art.logoBorder || art.logoTile);
        inset = 3;
      } else {
        brandLogo.classList.add("brand__logo--bare");
      }
      drawLogoEmoji(canvas, art.logoEmoji, inset);
      brandLogo.appendChild(canvas);
    }

    toggle.classList.toggle("is-light", art.isLight);
    toggle.style.setProperty("--knob", art.isLight ? 1 : 0);
    toggle.setAttribute("aria-pressed", String(art.isLight));

    paintBackdrop();
    if (snapshot) fadeVeil(snapshot);

    syncRail();
    syncSettings();
    try { localStorage.setItem("pagflow:theme", key); } catch (e) { /* modo privado */ }
  }

  function brandHTML(art) {
    const rotulo = art.brandLabel || "PagFlow";
    const label = `<span class="brand__label">${escapeHTML(rotulo)}</span>`;
    if (!art.brandSuffix) return `<span class="brand__line">${label}</span>`;
    const classes = ["brand__suffix"];
    if (art.brandSuffixSize) classes.push("brand__suffix--size");
    if (art.brandSuffixBg) classes.push("brand__suffix--bg");
    const sufixo = art.brandSuffixBg ? `&nbsp;${escapeHTML(art.brandSuffix)}&nbsp;` : escapeHTML(art.brandSuffix);
    // o app monta `rótulo + espaço + sufixo` em rich text: o vão é o espaço
    // (dois NBSP quando o sufixo tem corpo menor), então nada de margem.
    const gap = art.brandSuffixSize ? "&nbsp;&nbsp;" : " ";
    return `<span class="brand__line">${label}${gap}<span class="${classes.join(" ")}">${sufixo}</span></span>`;
  }
  const escapeHTML = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ══════════════════════════════════════════════════════════════════════
     STATUS, TELAS, CONTROLES
     ══════════════════════════════════════════════════════════════════════ */
  const statusEl = $("#status");
  const statusText = $("#statusText");
  const statusSpinner = $("#statusSpinner");

  function setStatus(text, kind = "idle") {
    state.status = { text, kind };
    statusEl.dataset.state = kind;
    statusText.textContent = text;
  }
  function setBusy(busy) {
    state.busy = busy;
    statusEl.classList.toggle("is-busy", busy);
    statusSpinner.hidden = !busy;
    $("#btnGerar").disabled = busy;
    $("#btnPreparar").disabled = busy;
  }

  /* telas */
  const VIEW = $("#viewSwitch");
  const viewButtons = $$(".switch__btn", VIEW);
  viewButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => goTab(i));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = (i + (e.key === "ArrowRight" ? 1 : viewButtons.length - 1)) % viewButtons.length;
      viewButtons[next].focus();
      goTab(next);
    });
  });
  function goTab(index) {
    if (index === state.tab) return;
    const pages = [$("#pageGerar"), $("#pageEnvio")];
    const outgoing = pages[state.tab];
    state.tab = index;
    VIEW.style.setProperty("--pos", index);
    $$(".switch__btn", VIEW).forEach((b, i) => b.setAttribute("aria-selected", String(i === index)));
    pages.forEach((p, i) => { p.hidden = i !== index; });
    if (!state.reduced) {
      outgoing.hidden = false;
      outgoing.classList.add("page--out");
      setTimeout(() => { outgoing.classList.remove("page--out"); outgoing.hidden = true; }, 240);
    }
    // a tela de envio é densa: as artes da faixa livre saem do fundo (Leila)
    const { art } = resolveTheme(state.key);
    if (art.pattern === "leila") paintBackdrop();
    else paintParticles(true);
  }

  /* segmentado */
  const SEG = $("#seg");
  SEG.style.setProperty("--seg-pos", state.seg);
  const segButtons = $$(".seg__btn", SEG);
  const pickSeg = (i) => {
    state.seg = i;
    SEG.style.setProperty("--seg-pos", i);
    segButtons.forEach((b, j) => b.setAttribute("aria-checked", String(j === i)));
  };
  segButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => pickSeg(i));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = (i + (e.key === "ArrowRight" ? 1 : segButtons.length - 1)) % segButtons.length;
      segButtons[next].focus();
      pickSeg(next);
    });
  });

  /* seleção (option popup) */
  const selectEl = $("#selectCor");
  const selectValue = $("#selectValue");
  let popup = null;
  function closePopup() {
    if (!popup) return;
    popup.remove();
    popup = null;
    selectEl.setAttribute("aria-expanded", "false");
  }
  selectEl.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (popup) { closePopup(); return; }
    const options = ["Verde", "Azul", "Roxo", "Vermelho"];
    popup = document.createElement("div");
    popup.className = "popup";
    popup.style.left = "-6px";
    popup.style.top = "28px";
    popup.style.width = `${selectEl.offsetWidth + 12}px`;
    popup.setAttribute("role", "listbox");
    popup.setAttribute("aria-label", "Cor do relatório");
    options.forEach((opt) => {
      const row = document.createElement("div");
      row.className = "popup__row" + (opt === state.color ? " is-current" : "");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(opt === state.color));
      row.innerHTML = `<span>${opt}</span><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 6.2 4.4 9 10.5 2.6"/></svg>`;
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        state.color = opt;
        selectValue.textContent = opt;
        closePopup();
        selectEl.focus();
      });
      popup.appendChild(row);
    });
    selectEl.appendChild(popup);
    selectEl.setAttribute("aria-expanded", "true");
    popup.querySelector(".popup__row.is-current")?.focus?.();
  });
  document.addEventListener("click", closePopup);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

  /* alternador de tema (lua ↔ sol) */
  toggle.addEventListener("click", (ev) => {
    const rect = toggle.getBoundingClientRect();
    const current = THEMES[state.key].isLight ? "light" : "dark";
    // clique por teclado (detail 0) ou sem coordenada: inverte o modo atual
    const target = ev.detail === 0 || (ev.clientX === 0 && ev.clientY === 0)
      ? (current === "dark" ? "light" : "dark")
      : (ev.clientX - rect.left < rect.width / 2 ? "dark" : "light");
    if (target === current) return;
    applyTheme(target);
  });

  /* botões de pasta: preenchem um caminho de exemplo e avisam na barra */
  const SAMPLE = {
    pasta: "C:\\SAP\\extratos_outubro",
    destino: "C:\\SAP\\consolidados",
    contatos: "C:\\SAP\\contatos_transportadoras.xlsx",
    relatorios: "C:\\SAP\\consolidados",
  };
  const basename = (p) => p.split(/[\\/]/).filter(Boolean).pop() || p;
  $("#btnPasta").addEventListener("click", () => {
    $("#entryPasta").value = SAMPLE.pasta;
    setStatus(`Pasta de entrada: ${basename(SAMPLE.pasta)}`, "idle");
  });
  $("#btnDestino").addEventListener("click", () => {
    $("#entryDestino").value = SAMPLE.destino;
    setStatus(`Destino definido: ${basename(SAMPLE.destino)}`, "idle");
  });
  $("#btnContatos").addEventListener("click", () => {
    $("#entryContatos").value = SAMPLE.contatos;
    setStatus(`Planilha de contatos: ${basename(SAMPLE.contatos)}`, "idle");
  });
  $("#btnRelatorios").addEventListener("click", () => {
    $("#entryRelatorios").value = SAMPLE.relatorios;
    setStatus(`Pasta de relatórios: ${basename(SAMPLE.relatorios)}`, "idle");
  });

  /* limpar campos */
  $("#btnLimpar").addEventListener("click", () => {
    ["#entryNome", "#entryPasta", "#entryDestino"].forEach((s) => { $(s).value = ""; });
    pickSeg(3);
    state.color = "Azul";
    selectValue.textContent = "Azul";
    setStatus("Campos limpos.", "idle");
  });

  /* gerar excel — simulação visual do fluxo */
  let timers = [];
  const clearTimers = () => { timers.forEach((t) => clearTimeout(t)); timers = []; };
  $("#btnGerar").addEventListener("click", () => {
    if (state.busy) return;
    const nome = $("#entryNome").value.trim();
    const pasta = $("#entryPasta").value.trim();
    const destino = $("#entryDestino").value.trim();
    const faltando = [];
    if (!nome) faltando.push("Nome do arquivo");
    if (!pasta) faltando.push("Pasta de entrada");
    if (!destino) faltando.push("Destino");
    if (faltando.length) {
      setStatus(`Campo(s) não preenchido(s): ${faltando.join(", ")}`, "aviso");
      return;
    }
    setBusy(true);
    setStatus(`Processando... · Separação: ${["Marca", "LNeg", "Fornecedor", "Não Separar"][state.seg]}`, "idle");
    timers.push(setTimeout(() => {
      setBusy(false);
      setStatus("Pronto para uso.", "idle");
      showMessage("Sucesso", `"${nome}" gerado com sucesso!`, "success");
    }, 1900));
  });

  /* envio — pré-checagem, revisão, disparo simulado */
  $("#btnInserir").addEventListener("click", () => {
    const body = $("#bodyCorpo");
    const start = body.selectionStart ?? body.value.length;
    body.value = body.value.slice(0, start) + "{fornecedor}" + body.value.slice(body.selectionEnd ?? start);
    body.focus();
    body.selectionStart = body.selectionEnd = start + 13;
  });
  $("#btnRestaurar").addEventListener("click", () => {
    showQuestion("Restaurar padrão", "Substituir o assunto e o corpo atuais pelos textos padrão?", () => {
      $("#entryAssunto").value = ENVIO_ASSUNTO;
      $("#bodyCorpo").value = ENVIO_CORPO;
    });
  });

  const ENVIO_ASSUNTO = "{fornecedor} — Relatório de pagamento";
  const ENVIO_CORPO = `Olá equipe {fornecedor}, tudo bem?

Segue em anexo o relatório de pagamento referente ao último pagamento realizado.

Em caso de dúvidas, permanecemos à disposição.

Atenciosamente,
Time Fretes - Distribuição Farma`;

  const PLANO = [
    { arquivo: "relatorio_outubro_ABC.xlsx", fornecedores: "100234, 100987", nome: "ABC Logística", para: "logistica@abclog.com.br", valor: 148320.55, status: "pronto" },
    { arquivo: "relatorio_outubro_TRANS.xlsx", fornecedores: "200145", nome: "TransNorte", para: "financeiro@transnorte.com.br; aud@transnorte.com.br", valor: 96480.10, status: "pronto", cfd: 2, valorCfd: 21340.00 },
    { arquivo: "relatorio_outubro_RAPIDO.xlsx", fornecedores: "300871", nome: "Rápido Sul", para: "contas@rapidosul.com.br", valor: 41905.00, status: "pronto", bloqueios: 1, valorBloq: 3180.00 },
    { arquivo: "relatorio_outubro_VIA.xlsx", fornecedores: "400220, 400221, 400223", nome: "Via Direta", para: "", valor: 78212.44, status: "sem_email" },
    { arquivo: "relatorio_outubro_NOVA.xlsx", fornecedores: "500311", nome: "Nova Carga", para: "admin@novacarga.com.br", valor: 12480.90, status: "pronto" },
    { arquivo: "relatorio_outubro_MULTI.xlsx", fornecedores: "600412", nome: "Multi Frota", para: "frota@multifrota.com.br", valor: 205774.62, status: "pronto", cfd: 3, valorCfd: 48700.00, bloqueios: 2, valorBloq: 9400.00 },
  ];
  const moeda = (v) => {
    const s = Math.abs(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${v < 0 ? "-" : ""}R$ ${s}`;
  };
  const ROTULO = {
    pronto: "Pronto para envio", sem_contato: "Fornecedor sem contato",
    sem_email: "Contato sem e-mail", email_invalido: "E-mail inválido",
    sem_fornecedor: "Sem fornecedor no arquivo", multi_fornecedor: "Transportadoras diferentes",
  };
  const avisosDe = (g) => {
    const partes = [];
    if (g.bloqueios) partes.push(`${g.bloqueios} bloqueio(s) — ${moeda(g.valorBloq || 0)}`);
    if (g.cfd) partes.push(`CFD — ${moeda(g.valorCfd || 0)} (${g.cfd} KT)`);
    return partes.join(" · ");
  };
  const totalPlano = () => PLANO.reduce((s, g) => s + g.valor, 0);

  $("#btnPreparar").addEventListener("click", () => {
    if (state.busy) return;
    const contatos = $("#entryContatos").value.trim();
    const pasta = $("#entryRelatorios").value.trim();
    const assunto = $("#entryAssunto").value.trim();
    const corpo = $("#bodyCorpo").value.trim();
    const faltando = [];
    if (!contatos) faltando.push("Selecione a planilha de contatos.");
    if (!pasta) faltando.push("Selecione a pasta com os relatórios.");
    if (!assunto) faltando.push("Escreva o assunto do e-mail.");
    if (!corpo) faltando.push("Escreva o corpo do e-mail.");
    if (faltando.length) {
      showMessage("Configuração incompleta", faltando.join("\n\n"), "warning");
      return;
    }
    setBusy(true);
    setStatus("Preparando envios…", "idle");
    $("#resumoEnvio").textContent = "Preparando os grupos de envio…";
    timers.push(setTimeout(() => {
      setBusy(false);
      const prontos = PLANO.filter((g) => g.status === "pronto").length;
      const resumo = `${PLANO.length} arquivo(s) · ${prontos} pronto(s) · ${PLANO.length - prontos} sem e-mail · total ${moeda(totalPlano())}`;
      $("#resumoEnvio").textContent = resumo;
      setStatus("Plano pronto — confirme o envio", "idle");
      openReview(resumo);
    }, 1250));
  });

  /* ══════════════════════════════════════════════════════════════════════
     MODAIS — camada, foco, Esc
     ══════════════════════════════════════════════════════════════════════ */
  let layerOpen = null;
  let lastFocus = null;

  function openLayer(node) {
    lastFocus = document.activeElement;
    node.hidden = false;
    layerOpen = node;
    $(".shell").inert = true;
    const focusable = node.querySelector("[data-autofocus]") || node.querySelector("button, input, textarea");
    setTimeout(() => focusable && focusable.focus(), 30);
  }
  function closeLayer(node) {
    node.hidden = true;
    layerOpen = null;
    $(".shell").inert = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }
  document.addEventListener("keydown", (e) => {
    if (!layerOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      const closer = layerOpen.querySelector("[data-escape]");
      if (closer) closer.click();
      else closeLayer(layerOpen);
      return;
    }
    if (e.key !== "Tab") return;
    const items = $$("button, input, textarea, [tabindex]:not([tabindex='-1'])", layerOpen)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ── caixa de mensagem (QMessageBox) ─────────────────────────────────── */
  const msgLayer = $("#msgLayer");
  let msgCallback = null;
  const ICONS = {
    success: `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="var(--ok-fg)"/><path d="M13 22.5l6 6 12-12" fill="none" stroke="var(--msg-mark,#062338)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    warning: `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="var(--warn-fg)"/><path d="M22 12v13" fill="none" stroke="#201C00" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="32" r="2" fill="#201C00"/></svg>`,
    question: `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="var(--accent)"/><path d="M16.5 17.5a5.5 5.5 0 1 1 7.6 5.1c-1.6.7-2.1 1.6-2.1 3.2" fill="none" stroke="var(--on-accent)" stroke-width="2.6" stroke-linecap="round"/><circle cx="22" cy="31.5" r="1.8" fill="var(--on-accent)"/></svg>`,
  };
  function showMessage(title, text, icon = "warning", onOk = null) {
    const { art } = resolveTheme(state.key);
    $("#msgIcon").style.setProperty("--msg-mark", art.isLight ? "#062338" : "#FFFFFF");
    $("#msgIcon").innerHTML = ICONS[icon] || ICONS.warning;
    $("#msgText").textContent = text;
    $("#msgTitle").textContent = title;
    $("#msgOk").textContent = "OK";
    msgCallback = onOk;
    if (icon === "question") {
      $("#msgOk").textContent = "Sim";
      $("#msgCancel").hidden = false;
      $("#msgCancel").textContent = "Não";
    } else {
      $("#msgCancel").hidden = true;
    }
    openLayer(msgLayer);
  }
  $("#msgOk").addEventListener("click", () => {
    const cb = msgCallback; msgCallback = null;
    closeLayer(msgLayer);
    if (cb) cb();
  });
  $("#msgCancel").addEventListener("click", () => { msgCallback = null; closeLayer(msgLayer); });
  function showQuestion(title, text, onYes) {
    showMessage(title, text, "question", onYes);
  }

  /* ── réplica do diálogo de revisão de envio ──────────────────────────── */
  const reviewLayer = $("#reviewLayer");
  const reviewTable = $("#reviewTable");
  const reviewChecks = new Map();
  let reviewGroups = [];

  function openReview(resumo) {
    reviewGroups = PLANO;
    $("#reviewStats").textContent = resumo;
    const copia = $("#entryCopia").value.trim();
    $("#reviewCopia").hidden = !copia;
    if (copia) $("#reviewCopia").textContent = `Em cópia (CC) em todos os e-mails: ${copia.split(/[;, ]+/).filter(Boolean).join("; ")}`;
    buildReviewRows();
    const marcados = reviewGroups.filter((g) => g.status === "pronto").length;
    $("#reviewQuestion").textContent = `Tem certeza que deseja enviar ${marcados} e-mail(s)?`;
    updateReviewSelection();
    openLayer(reviewLayer);
  }

  function buildReviewRows() {
    reviewTable.innerHTML = "";
    reviewChecks.clear();
    reviewGroups.forEach((g, i) => {
      const tr = document.createElement("tr");
      const pronto = g.status === "pronto";
      tr.dataset.pronto = String(pronto);
      const avisos = avisosDe(g) || "—";
      tr.innerHTML = `
        <td class="cell--check"><button class="check" type="button" role="checkbox" aria-checked="${pronto}" aria-label="Incluir ${escapeHTML(g.nome)} no envio">
          <span class="check__box"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.6 6.3 4.5 9.1 10.4 2.8"/></svg></span></button></td>
        <td title="${escapeHTML(g.arquivo)}">${escapeHTML(g.arquivo)}</td>
        <td>${escapeHTML(g.fornecedores)}</td>
        <td class="name">${escapeHTML(g.nome)}</td>
        <td class="${g.para ? "ok" : "muted"}">${escapeHTML(g.para ? g.para.split("; ").join("; ") : "—")}</td>
        <td class="cell--valor">${moeda(g.valor)}</td>
        <td class="${pronto ? "ok" : "err"}">${ROTULO[g.status] || g.status}</td>
        <td class="${g.bloqueios || g.cfd ? "warn" : "muted"}">${escapeHTML(avisos)}</td>`;
      const btn = tr.querySelector(".check");
      if (!pronto) btn.disabled = true;
      btn.addEventListener("click", () => {
        btn.setAttribute("aria-checked", btn.getAttribute("aria-checked") === "true" ? "false" : "true");
        updateReviewSelection();
      });
      reviewChecks.set(i, btn);
      reviewTable.appendChild(tr);
    });
  }

  function updateReviewSelection() {
    const prontos = reviewGroups.filter((g) => g.status === "pronto").length;
    let selecionados = 0, total = 0;
    reviewGroups.forEach((g, i) => {
      const btn = reviewChecks.get(i);
      const marcado = btn && btn.getAttribute("aria-checked") === "true" && g.status === "pronto";
      const tr = btn && btn.closest("tr");
      if (tr) tr.classList.toggle("is-selected", Boolean(marcado));
      if (marcado) { selecionados++; total += g.valor; }
    });
    $("#reviewSelection").textContent = `${selecionados} de ${prontos} grupo(s) pronto(s) selecionado(s) · Total selecionado: ${moeda(total)}`;
    $("#reviewQuestion").textContent = `Tem certeza que deseja enviar ${selecionados} e-mail(s)?`;
    const confirm = $("#reviewConfirm");
    confirm.disabled = selecionados === 0;
    confirm.textContent = selecionados ? `Confirmar envio (${selecionados})` : "Confirmar envio";
    const all = $("#reviewAll");
    all.setAttribute("aria-checked", String(selecionados === prontos && prontos > 0));
    reviewLayer.dataset.selected = String(selecionados);
  }

  $("#reviewAll").addEventListener("click", () => {
    const target = $("#reviewAll").getAttribute("aria-checked") !== "true";
    reviewGroups.forEach((g, i) => {
      if (g.status !== "pronto") return;
      reviewChecks.get(i).setAttribute("aria-checked", String(target));
    });
    updateReviewSelection();
  });
  $("#reviewCancel").addEventListener("click", () => {
    closeLayer(reviewLayer);
    setStatus("Envio cancelado antes do disparo", "aviso");
  });
  $("#reviewClose").addEventListener("click", () => $("#reviewCancel").click());
  $("#reviewConfirm").addEventListener("click", () => {
    const selecionados = Number(reviewLayer.dataset.selected || 0);
    if (!selecionados) return;
    closeLayer(reviewLayer);
    setBusy(true);
    let atual = 0;
    const nomes = reviewGroups.filter((g, i) => g.status === "pronto" && reviewChecks.get(i).getAttribute("aria-checked") === "true");
    const passo = () => {
      if (atual >= nomes.length) {
        setBusy(false);
        const resumo = `${nomes.length} enviado(s) · 0 falha(s) · 0 não encontrado(s)`;
        $("#resumoEnvio").textContent = resumo;
        setStatus(resumo, "idle");
        showMessage("Envios PagFlow", `Envio finalizado.\n\n${resumo}`, "success");
        return;
      }
      setStatus(`Enviando ${atual + 1} de ${nomes.length} — ${nomes[atual].nome}`, "idle");
      atual++;
      timers.push(setTimeout(passo, 420));
    };
    passo();
  });

  /* ══════════════════════════════════════════════════════════════════════
     CONFIGURAÇÕES (5 abas, grade de temas, inserir código)
     ══════════════════════════════════════════════════════════════════════ */
  const settingsLayer = $("#settingsLayer");
  const tabs = $$(".tab", settingsLayer);
  const pages = $$(".settings-page", settingsLayer);

  function switchSettingsTab(index) {
    tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === index)));
    pages.forEach((p, i) => { p.hidden = i !== index; });
    if (index === 1) setTimeout(() => $(".theme-card.is-active")?.focus(), 20);
    if (index === 3) setTimeout(() => $("#codeInput").focus(), 20);
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => switchSettingsTab(i)));

  function availableKeys() {
    return ORDER.filter((k) => CORE.has(k) || state.unlocked.has(k));
  }
  function syncSettings() {
    const grid = $("#themeGrid");
    if (!grid) return;
    const keys = availableKeys();
    grid.classList.toggle("theme-grid--compact", keys.length > 8);
    grid.innerHTML = "";
    keys.forEach((key) => {
      const { t, art } = resolveTheme(key);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "theme-card" + (key === state.key ? " is-active" : "");
      card.setAttribute("aria-pressed", String(key === state.key));
      const cardArt = Object.assign({}, ART_DEFAULTS, t.art || {});
      card.style.setProperty("--tc-bg", t.bgTop);
      card.style.setProperty("--tc-soft", t.accentSoft);
      card.style.setProperty("--tc-border", t.border);
      card.style.setProperty("--tc-accent", t.accent);
      card.style.setProperty("--tc-fg", t.text);
      card.style.setProperty("--tc-fg2", t.text2);
      card.style.setProperty("--tc-on", t.onAccent);
      card.style.setProperty("--tc-font", fontStack(cardArt.uiFont));
      card.innerHTML = `
        <span class="theme-card__name">${escapeHTML(t.label)}</span>
        <span class="theme-card__desc">${escapeHTML(art.description || "")}</span>
        ${key === state.key ? '<span class="theme-card__pill">ATIVO</span>' : ""}`;
      card.addEventListener("click", () => { unlock(key); applyTheme(key); });
      grid.appendChild(card);
    });
    $("#pillCurrent").textContent = THEMES[state.key].label;
  }

  function unlock(key) {
    if (!CORE.has(key)) state.unlocked.add(key);
  }

  $("#btnConfig").addEventListener("click", () => {
    switchSettingsTab(3);
    $("#codeInput").value = "";
    $("#feedback").hidden = true;
    openLayer(settingsLayer);
  });
  $("#settingsClose").addEventListener("click", () => closeLayer(settingsLayer));
  $("#settingsDone").addEventListener("click", () => closeLayer(settingsLayer));

  $("#checkReduzir").addEventListener("click", () => {
    const btn = $("#checkReduzir");
    const on = btn.getAttribute("aria-checked") !== "true";
    btn.setAttribute("aria-checked", String(on));
    state.reducedPref = on;
    state.reduced = on || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    paintParticles(state.reduced);
    if (state.reduced) paintParticles(true);
  });

  $("#btnRestaurarPadrao").addEventListener("click", () => applyTheme("dark"));
  $("#btnEsquecer").addEventListener("click", () => {
    showQuestion("Esquecer temas desbloqueados", "Remover da memória os temas secretos já desbloqueados?\n\nEles voltam a ficar ocultos e o tema atual retorna ao escuro.", () => {
      state.unlocked.clear();
      applyTheme("dark");
      syncSettings();
    });
  });

  $("#btnAtivar").addEventListener("click", activateCode);
  $("#codeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") activateCode(); });

  function activateCode() {
    const code = $("#codeInput").value;
    const key = CODE_TO_KEY[normalize(code)];
    const feedback = $("#feedback");
    if (!key) {
      feedback.className = "feedback is-err";
      feedback.innerHTML = "<b>Código não reconhecido.</b><br>Confira o nome do tema e tente novamente. Nada foi alterado.";
      feedback.hidden = false;
      return;
    }
    state.unlocked.add(key);
    feedback.className = "feedback";
    feedback.innerHTML = `<b>Tema ${escapeHTML(THEMES[key].label)} ativado.</b><br>O tema foi aplicado e será lembrado na próxima abertura.`;
    feedback.hidden = false;
    $("#pillCurrent").textContent = THEMES[key].label;
    applyTheme(key);
  }

  /* ══════════════════════════════════════════════════════════════════════
     TRILHA DE TEMAS (chrome do portfólio)
     ══════════════════════════════════════════════════════════════════════ */
  const railThemes = $("#railThemes");
  ORDER.forEach((key) => {
    const { t } = resolveTheme(key);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tbtn";
    b.dataset.key = key;
    b.setAttribute("aria-pressed", "false");
    b.title = `Tema ${t.label}`;
    b.innerHTML = `<i class="tbtn__sw" aria-hidden="true" style="background:${swatch(key)}"></i>${escapeHTML(t.label)}`;
    b.addEventListener("click", () => {
      unlock(key);
      applyTheme(key);
      syncSettings();
      switchSettingsTab(3);
      b.blur();
    });
    railThemes.appendChild(b);
  });
  function swatch(key) {
    const t = THEMES[key];
    const a = t.art || {};
    if (key === "ozzy") return "linear-gradient(135deg,#0B0A0A 0 38%,#920703 58%,#FBE500 100%)";
    if (key === "natal") return "linear-gradient(135deg,#F4FCF7,#286B41 55%,#C41E3A)";
    if (key === "leila") return "linear-gradient(135deg,#F7F9FF,#FEA619)";
    if (key === "wolverine") return "linear-gradient(135deg,#FAF8FF,#F5BA13 55%,#3B5E9A)";
    if (key === "vaporwave") return "linear-gradient(135deg,#1E182E,#FF4A8D 55%,#00EEFC)";
    if (key === "alien") return "linear-gradient(135deg,#111413,#00FF66)";
    if (key === "flowerboy") return "linear-gradient(135deg,#FFEADF,#F59E0B 60%,#3B6934)";
    if (key === "graduation") return "linear-gradient(135deg,#FF7AB8,#8FA6F2)";
    if (key === "lana") return "linear-gradient(135deg,#FFF8F8,#C81D3B)";
    if (key === "acai") return "linear-gradient(135deg,#14001C,#7E22CE 65%,#FBBF24)";
    if (key === "light") return "linear-gradient(135deg,#E7F2FD,#BFE4FB)";
    return "linear-gradient(135deg,#091522,#1B3A5C)";
  }
  function syncRail() {
    $$(".tbtn", railThemes).forEach((b) => {
      const active = b.dataset.key === state.key;
      b.setAttribute("aria-pressed", String(active));
    });
  }

  /* gaveta dos temas (chrome do portfólio) */
  const railToggle = $("#railToggle");
  const rail = $("#rail");
  function setRail(open) {
    document.body.classList.toggle("rail-open", open);
    railToggle.setAttribute("aria-expanded", String(open));
    rail.inert = !open;
    rail.setAttribute("aria-hidden", String(!open));
    setTimeout(() => {
      fit();
      if (open) {
        rail.scrollIntoView({ block: "end", behavior: state.reduced ? "auto" : "smooth" });
      }
    }, 300);
  }
  railToggle.addEventListener("click", () => {
    setRail(!document.body.classList.contains("rail-open"));
  });
  setRail(false);

  /* botões de demonstração */
  $("#demoFill").addEventListener("click", () => {
    $("#entryNome").value = "relatorio_outubro";
    $("#entryPasta").value = SAMPLE.pasta;
    $("#entryDestino").value = SAMPLE.destino;
    $("#entryContatos").value = SAMPLE.contatos;
    $("#entryRelatorios").value = SAMPLE.relatorios;
    setStatus("Exemplo preenchido — clique em Gerar Excel.", "idle");
  });
  $("#demoSettings").addEventListener("click", () => $("#btnConfig").click());
  $("#demoReview").addEventListener("click", () => {
    $("#entryContatos").value = SAMPLE.contatos;
    $("#entryRelatorios").value = SAMPLE.relatorios;
    $("#entryAssunto").value = ENVIO_ASSUNTO;
    $("#bodyCorpo").value = ENVIO_CORPO;
    goTab(1);
    const resumo = `${PLANO.length} arquivo(s) · ${PLANO.filter((g) => g.status === "pronto").length} pronto(s) · 1 sem e-mail · total ${moeda(totalPlano())}`;
    $("#resumoEnvio").textContent = resumo;
    setStatus("Plano pronto — confirme o envio", "idle");
    openReview(resumo);
  });
  $("#demoCodes").addEventListener("click", () => {
    const box = $("#codes");
    box.hidden = !box.hidden;
    $("#demoCodes").textContent = box.hidden ? "Ver códigos" : "Ocultar códigos";
  });

  /* ── escala da janela ────────────────────────────────────────────────── */
  const stage = $(".stage");
  const frameWrap = $("#frameWrap");
  const board = $("#board");
  function fit() {
    const wrap = $(".wrap");
    const wrapStyle = getComputedStyle(wrap);
    const availW = wrap.clientWidth
      - (parseFloat(wrapStyle.paddingLeft) || 0)
      - (parseFloat(wrapStyle.paddingRight) || 0);
    // telas baixas ganham a versão compacta antes de medir a moldura disponível
    document.body.classList.toggle("is-compact", window.innerHeight < 1020);
    const chrome = $(".masthead").offsetHeight + $(".rail").offsetHeight + 84;
    const fitH = (window.innerHeight - chrome) / H;
    // 0.8 é o piso de legibilidade: abaixo disso a página rola em vez de encolher
    const s = Math.min(1, availW / W, Math.max(0.8, fitH));
    state.scale = s;
    board.style.setProperty("--s", s);
    frameWrap.style.width = `${W * s}px`;
    frameWrap.style.height = `${H * s}px`;
    paintBackdrop();
  }
  let fitTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fit, 110);
  });

  /* ── inicialização ───────────────────────────────────────────────────── */
  (function boot() {
    let saved = null;
    try { saved = localStorage.getItem("pagflow:theme"); } catch (e) { /* ignorado */ }
    const start = saved && THEMES[saved] ? saved : "dark";
    if (start !== "dark") unlock(start);
    state.key = start;
    fit();
    applyTheme(start, { animate: false });
    $("#entryAssunto").value = ENVIO_ASSUNTO;
    $("#bodyCorpo").value = ENVIO_CORPO;
    syncSettings();
    paintParticles(true);
    requestAnimationFrame(loop);
    ["assets/img/theme-art-01.jpg", "assets/img/theme-art-02.jpg", "assets/img/theme-art-03.jpg",
      "assets/img/leila.png", "assets/img/leila-caramelo.png"].forEach((src) => image(src));
  })();
})();
