import { contactCta } from "@/content/profile";
import { cn } from "@/lib/cn";
import { ArrowUpRight, MailIcon } from "@/components/ui/icons";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { SectionLabel } from "@/components/ui/SectionLabel";

const icons = {
  mail: MailIcon,
  "arrow-up-right": ArrowUpRight,
} as const;

export function Contact() {
  return (
    <section className="section" id="contato" aria-labelledby="contato-title">
      <div className="container">
        <div className="contact__panel" data-reveal>
          <SectionLabel num="03">Contato</SectionLabel>
          <h2 id="contato-title">
            Tem um desafio?
            <br />
            <em>Vamos olhar os dados juntos.</em>
          </h2>
          <p>
            Estou aberto a conversas sobre análise de dados, melhoria de processos,
            automação e projetos em que tecnologia e pessoas precisem caminhar juntas. Se
            você chegou até aqui, me conte o problema — o resto a gente organiza.
          </p>
          <div className="contact__actions">
            {contactCta.map((action) => {
              const Icon = icons[action.icon];
              return (
                <MagneticLink
                  key={action.label}
                  className={cn("btn", action.variant === "primary" ? "btn--primary" : "btn--ghost", "btn--lg")}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                >
                  {action.label}
                  <Icon />
                </MagneticLink>
              );
            })}
          </div>
          <p className="contact__hint">
            Cajamar, São Paulo · Brasil. Prefere LinkedIn? Também estou por lá.
          </p>
        </div>
      </div>
    </section>
  );
}
