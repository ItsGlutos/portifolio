import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="section-label">
        <span className="chip-num">404</span>
        Rota perdida
        <span className="section-label__line" aria-hidden="true" />
      </p>
      <h1>Essa página saiu do mapa estelar.</h1>
      <p>
        O endereço não existe ou mudou de lugar. O céu continua aqui — volte ao início para
        continuar a leitura.
      </p>
      <Link className="btn btn--primary btn--lg" href="/">
        Voltar ao início
      </Link>
    </div>
  );
}
