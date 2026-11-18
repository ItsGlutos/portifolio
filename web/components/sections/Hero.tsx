import { brand, heroMeta } from "@/content/profile";
import { asset } from "@/lib/asset";
import { ArrowDown, ArrowUpRight, BarsIcon, ChartLineIcon, CubeIcon } from "@/components/ui/icons";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { PortraitTilt } from "@/components/ui/PortraitTilt";

const metaIcons = {
  chart: ChartLineIcon,
  bars: BarsIcon,
  cube: CubeIcon,
} as const;

/**
 * O hero fica **fora** do reveal de propósito.
 *
 * Antes ele nascia com `opacity: 0` esperando a hidratação: em rede móvel isso
 * entregava um título solto num vazio por dezenas de segundos. Aqui o texto
 * aparece no primeiro paint; a única entrada é a do próprio título, em CSS.
 */
export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="dot dot--success" aria-hidden="true" />
            <span>{brand.role}</span>
            <span className="sep" aria-hidden="true" />
            <span>{brand.location}</span>
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="line">
              <span>Entendo o fluxo.</span>
            </span>
            <span className="line">
              <span>Leio os dados.</span>
            </span>
            <span className="line">
              <span>
                Apoio <span className="accent">decisões</span>.
              </span>
            </span>
          </h1>

          <p className="hero__lead">
            Sou profissional de dados, com perfil analítico. Investigo indicadores,
            compreendo processos e uso <strong>automação e programação</strong> para
            devolver tempo às equipes e apoiar decisões melhores.
          </p>

          <div className="hero__actions">
            <MagneticLink className="btn btn--primary btn--lg" href="#projetos">
              Explorar projetos
              <ArrowDown />
            </MagneticLink>
            <MagneticLink className="btn btn--ghost btn--lg" href="#sobre">
              Sobre mim
              <ArrowUpRight />
            </MagneticLink>
          </div>

          <p className="hero__meta">
            {heroMeta.map((item) => {
              const Icon = metaIcons[item.icon];
              return (
                <span key={item.label}>
                  <Icon />
                  {item.label}
                </span>
              );
            })}
          </p>
        </div>

        <div className="hero__visual">
          <div className="orbit orbit--1" aria-hidden="true">
            <span className="orbit__node" />
          </div>
          <div className="orbit orbit--2" aria-hidden="true">
            <span className="orbit__node" />
          </div>

          <PortraitTilt>
            <figure className="portrait" id="portrait">
              <span className="portrait__ticks" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <div className="portrait__top">
                <span>Fig. 01 — marca pessoal</span>
                <span>{brand.year}</span>
              </div>
              <div className="portrait__imgwrap" data-parallax="0.06">
                <img
                  className="portrait__img"
                  src={asset("/assets/brand/guto-mark.svg")}
                  alt="Retrato estilizado de Gustavo em azul celeste, envolvido por um anel orbital"
                  width={420}
                  height={420}
                  fetchPriority="high"
                />
              </div>
              <figcaption className="portrait__bottom">
                <span className="brand__word">
                  {brand.word}
                  <span>{brand.wordAccent}</span>
                </span>
                <em>Portfólio / {brand.year}</em>
              </figcaption>
              <span className="portrait__glare" aria-hidden="true" />
            </figure>
          </PortraitTilt>
        </div>
      </div>
    </section>
  );
}
