import { socials } from "@/content/profile";
import { InfoIcon } from "@/components/ui/icons";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";

export function Projects() {
  return (
    <section className="section" id="projetos" aria-labelledby="projetos-title">
      <div className="container">
        <ProjectsBrowser />

        <p className="projects__note" data-reveal>
          <InfoIcon />
          <span>
            Parte dos projetos é corporativa e permanece privada. Se quiser ver arquitetura,
            decisões ou uma demonstração com dados fictícios, me chame — apresento o que for
            possível.{" "}
            <a href={socials.linkedin.href} target="_blank" rel="noopener noreferrer">
              Perfil no LinkedIn
            </a>
            .
          </span>
        </p>
      </div>
    </section>
  );
}
