import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import type { Project } from "@/content/projects";
import { padIndex } from "@/content/projects";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";
import {
  ArrowRight,
  ClockIcon,
  LockIcon,
  MediumMark,
} from "@/components/ui/icons";
import { ReadingArt, StandardArt } from "./ProjectArt";
import { PagflowCta } from "./PagflowCta";

type ProjectCardProps = {
  project: Project;
  number: number;
  delay: number;
  /** Cartão criado por uma troca de filtro: entra visível, sem esperar observer. */
  instant?: boolean;
};

/** Spotlight: a luz do cartão acompanha o ponteiro via CSS vars. */
function handleSpotlight(event: PointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  element.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function cardStyle(number: number): CSSProperties {
  return {
    "--reveal-delay": number,
    viewTransitionName: `project-${number}`,
  } as CSSProperties;
}

function Tags({ tags }: { tags: readonly string[] }) {
  return (
    <div className="project__tags">
      {tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

export function ProjectCard({ project, number, delay, instant = false }: ProjectCardProps) {
  const style = cardStyle(delay);
  const { ref, inView } = useInView<HTMLElement>({ initial: instant });

  /* Depois que o filtro é usado, todo resultado aparece na hora: a troca de
     layout dentro da View Transition não dispara o IntersectionObserver. */
  const [forced, setForced] = useState(instant);
  useEffect(() => {
    if (instant) setForced(true);
  }, [instant]);

  const visible = inView || forced;

  if (project.kind === "showcase") {
    return (
      <article
        ref={ref}
        className={cn("project project--wide project--showcase", visible && "is-visible")}
        data-category={project.categories.join(" ")}
        data-reveal=""
        style={style}
        onPointerMove={handleSpotlight}
      >
        <div className="project__thumb project__thumb--icon">
          <span className="project__index">{padIndex(number)}</span>
          <span className="project__halo" aria-hidden="true" />
          <span className="project__live">
            <span className="project__live-dot" aria-hidden="true" />
            Demo ao vivo
          </span>
          <span className="project__icon-wrap">
            <img
              className="project__icon"
              src={asset("/assets/projects/pagflow-icon.svg")}
              alt="Ícone oficial do PagFlow: cifrão escuro sobre uma seta circular azul, em um quadrado arredondado azul-marinho."
            />
          </span>
        </div>

        <div className="project__body">
          <p className="project__kicker">{project.kicker}</p>
          <h3>{project.title}</h3>
          <p className="project__desc">{project.description}</p>
          <Tags tags={project.tags} />
          <PagflowCta href={project.cta.href} label={project.cta.label} />
          <p className="project__meta">
            <span>{project.meta}</span>
            <span className="project__year">{project.year}</span>
          </p>
        </div>
      </article>
    );
  }

  if (project.kind === "reading") {
    return (
      <article
        ref={ref}
        className={cn("project project--reading", visible && "is-visible")}
        data-category={project.categories.join(" ")}
        data-reveal=""
        style={style}
        onPointerMove={handleSpotlight}
      >
        <div className="project__rail">
          <span className="project__index">{padIndex(number)}</span>
          <ReadingArt art={project.art} />
        </div>

        <div className="project__body">
          <p className="project__kicker">{project.kicker}</p>
          <h3>{project.title}</h3>
          <p className="project__desc">{project.description}</p>
          <Tags tags={project.tags} />
        </div>

        <div className="project__side">
          <p className="project__read-meta">
            <ClockIcon />
            {project.readMinutes} min de leitura
          </p>
          <a
            className="project__read"
            href={project.href}
            target="_blank"
            rel="noopener"
          >
            <MediumMark className="project__read-mark" />
            Ler no Medium
            <ArrowRight className="project__read-arrow" strokeWidth={2} />
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
          <p className="project__year">{project.year}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={ref}
      className={cn("project", visible && "is-visible")}
      data-category={project.categories.join(" ")}
      data-reveal=""
      style={style}
      onPointerMove={handleSpotlight}
    >
      <div className="project__thumb">
        <span className="project__index">{padIndex(number)}</span>
        <span className="project__status">
          <LockIcon />
          {project.status}
        </span>
        <StandardArt art={project.art} />
      </div>

      <div className="project__body">
        <p className="project__kicker">{project.kicker}</p>
        <h3>{project.title}</h3>
        <p className="project__desc">{project.description}</p>
        <Tags tags={project.tags} />
      </div>

      <div className="project__foot">
        <span>{project.foot}</span>
        <span className="project__year">{project.year}</span>
      </div>
    </article>
  );
}
