import type { ReadingProject, StandardProject } from "@/content/projects";

/** Arte do cartão de leitura: duas listas unidas por uma seta (ETL). */
function MergeArt() {
  return (
    <svg className="project__rail-art" viewBox="0 0 300 190" aria-hidden="true" focusable="false">
      <g stroke="#2a567f" strokeWidth="1" opacity=".38">
        <path d="M12 158h276M12 34h276" />
      </g>
      <g fill="#16324f">
        <rect x="16" y="52" width="88" height="9" rx="4.5" />
        <rect x="16" y="70" width="60" height="9" rx="4.5" />
        <rect x="16" y="88" width="96" height="9" rx="4.5" />
        <rect x="16" y="106" width="52" height="9" rx="4.5" />
        <rect x="16" y="124" width="76" height="9" rx="4.5" />
      </g>
      <path d="M126 88h28" stroke="#55ceff" strokeWidth="1.6" strokeLinecap="round" strokeOpacity=".75" />
      <path
        d="M149 82l7 6-7 6"
        fill="none"
        stroke="#55ceff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#55ceff" opacity=".85">
        <rect x="170" y="52" width="112" height="9" rx="4.5" />
        <rect x="170" y="70" width="112" height="9" rx="4.5" />
        <rect x="170" y="88" width="112" height="9" rx="4.5" />
        <rect x="170" y="106" width="112" height="9" rx="4.5" />
        <rect x="170" y="124" width="112" height="9" rx="4.5" />
      </g>
      <circle cx="264" cy="146" r="9" fill="#0d2137" stroke="#8fe0ff" strokeWidth="1.4" />
      <path
        d="M259.5 146l3.2 3.4 6-6.8"
        fill="none"
        stroke="#8fe0ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Arte do cartão de leitura: grafo de relações e dois nós acesos. */
function GraphArt() {
  return (
    <svg className="project__rail-art" viewBox="0 0 300 190" aria-hidden="true" focusable="false">
      <g stroke="#2a567f" strokeWidth="1" opacity=".38">
        <path d="M12 158h276M12 34h276" />
      </g>
      <path d="M150 40v112" stroke="#2a567f" strokeWidth="1" strokeDasharray="4 5" opacity=".4" />
      <g fill="none" stroke="#2a567f" strokeWidth="1.2" opacity=".6">
        <path d="M42 74l38-14 34 30-24 34-40-8z" />
        <path d="M80 60l52 30M114 90l-16 34M80 136l40 8" />
        <path d="M186 84l34-12 36 22M220 72l30 22M196 108l54-14M250 94l-6 32M244 126l-48 18" />
      </g>
      <g fill="#16324f" stroke="#2a567f" strokeWidth="1.1">
        <circle cx="42" cy="74" r="5.5" />
        <circle cx="80" cy="60" r="5.5" />
        <circle cx="114" cy="90" r="5.5" />
        <circle cx="80" cy="136" r="5.5" />
        <circle cx="120" cy="130" r="5.5" />
        <circle cx="220" cy="72" r="5.5" />
        <circle cx="250" cy="94" r="5.5" />
        <circle cx="244" cy="126" r="5.5" />
        <circle cx="196" cy="144" r="5.5" />
      </g>
      <circle cx="186" cy="84" r="13" fill="none" stroke="#8fe0ff" strokeWidth="1.2" opacity=".55" />
      <circle cx="186" cy="84" r="7" fill="#55ceff" />
      <circle cx="196" cy="108" r="7" fill="#55ceff" opacity=".5" />
    </svg>
  );
}

/** Arte do cartão padrão: barras de meta com linha de referência. */
function KpiArt() {
  return (
    <svg
      className="project__art"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="kpi-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2c77c6" stopOpacity=".35" />
          <stop offset="100%" stopColor="#55ceff" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <g stroke="#2a567f" strokeWidth="1" opacity=".45">
        <path d="M0 190h400M0 140h400M0 90h400M0 40h400" />
      </g>
      <g fill="url(#kpi-bar)">
        <rect x="38" y="92" width="28" height="98" rx="4" />
        <rect x="80" y="74" width="28" height="116" rx="4" />
        <rect x="122" y="60" width="28" height="130" rx="4" />
        <rect x="164" y="84" width="28" height="106" rx="4" />
        <rect x="206" y="116" width="28" height="74" rx="4" />
        <rect x="248" y="132" width="28" height="58" rx="4" />
        <rect x="290" y="104" width="28" height="86" rx="4" />
        <rect x="332" y="66" width="28" height="124" rx="4" />
      </g>
      <path
        d="M28 120h344"
        stroke="#8fe0ff"
        strokeWidth="1.4"
        strokeDasharray="5 5"
        strokeOpacity=".65"
      />
      <circle cx="262" cy="132" r="4" fill="#8fe0ff" />
      <rect x="38" y="28" width="86" height="7" rx="3.5" fill="#1b3a5c" />
      <rect x="132" y="28" width="48" height="7" rx="3.5" fill="#16324f" />
    </svg>
  );
}

/** Arte do cartão padrão: série temporal com dois pontos de atenção. */
function AutomationArt() {
  return (
    <svg
      className="project__art"
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#2a567f" strokeWidth="1" opacity=".5">
        <path d="M0 196h400M0 146h400M0 96h400" />
      </g>
      <path
        d="M16 146h112l16-26 14 52 18-78 16 90 14-38h124"
        fill="none"
        stroke="#55ceff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 146h112l16-26 14 52 18-78 16 90 14-38h124"
        fill="none"
        stroke="#8fe0ff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".12"
      />
      <g fill="#8fe0ff">
        <circle cx="158" cy="94" r="3.4" />
        <circle cx="190" cy="184" r="3.4" />
      </g>
      <g fill="#16324f">
        <rect x="28" y="30" width="74" height="26" rx="7" />
        <rect x="110" y="30" width="48" height="26" rx="7" />
      </g>
      <g stroke="#55ceff" strokeOpacity=".6">
        <path d="M44 43h42M124 43h20" />
      </g>
      <path
        d="M330 30l14 8-14 8"
        fill="none"
        stroke="#55ceff"
        strokeOpacity=".8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReadingArt({ art }: { art: ReadingProject["art"] }) {
  return art === "merge" ? <MergeArt /> : <GraphArt />;
}

export function StandardArt({ art }: { art: StandardProject["art"] }) {
  return art === "kpi" ? <KpiArt /> : <AutomationArt />;
}
