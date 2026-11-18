"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import {
  filters,
  matchesFilter,
  projectCount,
  projects,
  type FilterKey,
} from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { REVEAL_REFRESH_EVENT } from "@/components/motion/RevealRoot";
import { ProjectCard } from "./ProjectCard";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function formatCount(value: number): string {
  return String(value).padStart(2, "0");
}

export function ProjectsBrowser() {
  const [filter, setFilter] = useState<FilterKey>("todos");
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => projects.filter((project) => matchesFilter(project, filter)),
    [filter],
  );

  function changeFilter(next: FilterKey) {
    if (next === filter) return;

    const apply = () => setFilter(next);
    const doc = document as ViewTransitionDocument;

    /* View Transition nativa: os cartões entram/saem com continuidade,
       sem remontar a grade e sem perder o estado de revelação. */
    if (!reduced && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => {
        flushSync(apply);
      });
      return;
    }
    apply();
  }

  /* A grade mudou de altura: avisa a revelação para trazer ao palco o que
     passou a estar na tela (o IntersectionObserver não reavalia sozinho
     durante a View Transition). */
  useEffect(() => {
    document.dispatchEvent(new Event(REVEAL_REFRESH_EVENT));
  }, [filter]);

  return (
    <>
      <div className="projects__bar">
        <div className="projects__intro" data-reveal>
          <p className="section-label">
            <span className="chip-num">02</span>
            Projetos
            <span className="section-label__line" aria-hidden="true" />
          </p>
          <h2 id="projetos-title">Casos selecionados.</h2>
          <p>
            Cinco trabalhos que mostram como penso: um app de consolidação centrado no
            usuário, dois artigos publicados no Medium — sobre automação que pegou na
            equipe e sobre ética em IA generativa —, uma investigação de indicadores
            logísticos e automações de rotina administrativa. Parte do material é
            confidencial; posso apresentar o que for possível em uma conversa.
          </p>
        </div>

        <div
          className="projects__top"
          data-reveal
          style={{ "--reveal-delay": 1 } as CSSProperties}
        >
          <div className="segmented" role="group" aria-label="Filtrar projetos por categoria">
            {filters.map((item) => (
              <button
                key={item.key}
                className="segmented__btn"
                type="button"
                data-filter={item.key}
                aria-pressed={filter === item.key}
                aria-controls="projects-grid"
                onClick={() => changeFilter(item.key)}
              >
                {item.label}{" "}
                <span className="segmented__count">{formatCount(projectCount(item.key))}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" id="projects-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? "projeto exibido" : "projetos exibidos"}
      </p>

      <div className="projects__grid" id="projects-grid">
        {visible.map((project, position) => (
          <ProjectCard
            key={project.slug}
            project={project}
            number={projects.indexOf(project)}
            delay={position}
          />
        ))}
      </div>
    </>
  );
}
