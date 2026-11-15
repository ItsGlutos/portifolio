import type { CSSProperties } from "react";
import { facts, pillars, toolbox } from "@/content/profile";
import { CodeIcon, CubeIcon, SheetIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/SectionLabel";

const pillarIcons = {
  sheet: SheetIcon,
  code: CodeIcon,
  cube: CubeIcon,
} as const;

export function About() {
  return (
    <section className="section" id="sobre" aria-labelledby="sobre-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <SectionLabel num="01">Sobre</SectionLabel>
          <h2 id="sobre-title">
            Dados com contexto.
            <br />
            Decisões com critério.
          </h2>
          <p>
            Não separo o número do processo que o produziu. Meu trabalho é entender o
            que o indicador representa, ouvir quem executa a operação e usar tecnologia
            para reduzir esforço — não para esconder complexidade.
          </p>
        </div>

        <div className="about__grid">
          <div className="about__aside" data-reveal>
            <blockquote className="pullquote">
              “Trabalho com dados para compreender problemas, melhorar processos e apoiar
              decisões. A tecnologia é o meio; as pessoas são o motivo.”
              <cite>— síntese de trabalho</cite>
            </blockquote>

            <dl className="facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.status && <span className="dot dot--success" aria-hidden="true" />}
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="about__body"
            data-reveal
            style={{ "--reveal-delay": 1 } as CSSProperties}
          >
            <p className="about__lead">
              Sou <strong>profissional de dados, com perfil analítico</strong>. Meu
              trabalho começa antes do número: entender o processo, ouvir quem executa a
              rotina e identificar onde a informação se perde.
            </p>
            <p>
              Minha trajetória passou por operações e rotinas administrativas; contextos
              em que vi de perto o custo do trabalho manual e a distância entre um sistema
              e as pessoas que precisam usá-lo. Hoje atuo em uma frente que me possibilita
              acompanhar e melhorar indicadores logísticos de transporte, investigando
              resultados e dialogando com áreas parceiras.
            </p>
            <p>
              Uso programação, automação e BI como instrumentos. O objetivo não é
              automatizar por automatizar: é reduzir o esforço operacional para que as
              pessoas tenham mais tempo de analisar, aprender e decidir, ou preferencialmente{" "}
              <strong>gerar valor</strong>. Também estudo LGPD, acessibilidade WCAG e UX
              porque uma solução só gera valor quando é compreensível e confiável para quem
              usa.
            </p>
            <p>
              Ao contrário do que pode parecer a primeiro momento, não me vejo no mercado
              de desenvolvimento, engenharia de dados ou correlatas, me identifico
              fortemente com a análise de dados e tomadas de decisões que ela me
              possibilita.
            </p>

            <ul className="pillars">
              {pillars.map((pillar) => {
                const Icon = pillarIcons[pillar.icon];
                return (
                  <li className="pillar" key={pillar.title}>
                    <span className="pillar__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <div>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="toolbox">
              <p className="toolbox__title">Ferramentas do dia a dia</p>
              <ul className="toolbox__list">
                {toolbox.map((tool) => (
                  <li key={tool}>
                    <span className="tag tag--mono">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
