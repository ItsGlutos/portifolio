import { brand, nav, socials } from "@/content/profile";
import { asset } from "@/lib/asset";
import { ArrowUpRight } from "@/components/ui/icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="brand" href="#inicio" aria-label={`${brand.word}${brand.wordAccent} — voltar ao início`}>
              <img
                className="brand__tile"
                src={asset("/assets/brand/guto-logo.svg")}
                alt=""
                width={36}
                height={36}
              />
              <span className="brand__word">
                {brand.word}
                <span>{brand.wordAccent}</span>
              </span>
            </a>
            <p>
              {brand.word}
              {brand.wordAccent} — portfólio de {brand.name}: análise de dados, processos e
              automação. Feito com React, Next.js e um canvas de estrelas.
            </p>
          </div>

          <div className="footer__col">
            <h3>Navegar</h3>
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="footer__col">
            <h3>Em outro lugar</h3>
            {Object.values(socials).map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
                <ArrowUpRight />
              </a>
            ))}
            <a href={`mailto:${brand.email}`}>E-mail</a>
            <a href="#inicio">Voltar ao topo ↑</a>
          </div>
        </div>

        <div className="footer__status">
          <span>
            <span className="dot dot--success" aria-hidden="true" /> Pronto · portfólio v2.0
          </span>
          <span>
            © {year} {brand.word}
            {brand.wordAccent} · Céu Estrelado
          </span>
        </div>
      </div>
    </footer>
  );
}
