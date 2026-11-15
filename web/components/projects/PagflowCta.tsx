"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { pagflowNotice } from "@/content/projects";
import { ArrowRight, InfoIcon, MonitorIcon } from "@/components/ui/icons";

/**
 * CTA da prévia do PagFlow com aviso de mobile.
 *
 * A réplica é uma janela de desktop (1280 × 960). Em tela pequena ela cabe na
 * largura porque encolhe até ~27% — mas aí o texto não é legível e os
 * controles ficam fora de alcance. Em vez de esconder a demo, o site avisa:
 *
 * 1. uma nota discreta no cartão (só em telas até 900 px);
 * 2. antes de abrir, um `<dialog>` nativo — foco preso, `Esc`, `::backdrop` e
 *    devolução do foco ficam por conta do navegador, sem biblioteca;
 * 3. no desktop nada muda: o link abre direto em nova aba.
 *
 * O diálogo vive num portal no `<body>` para não herdar `overflow`/`opacity`
 * do cartão e para ficar na camada modal de verdade.
 */

/** Abaixo disto a janela de 1280 px já não é utilizável. */
const MOBILE_QUERY = "(max-width: 900px)";

export function PagflowCta({ href, label }: { href: string; label: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => setMounted(true), []);

  function intercept(event: MouseEvent<HTMLAnchorElement>) {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    /* Sem `showModal` (Safari < 15.4) o link segue o caminho normal: melhor
       abrir a demo sem aviso do que impedir o clique e não mostrar nada. */
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;

    event.preventDefault();
    dialog.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function openAnyway() {
    close();
    /* `showModal` tira a ativação do usuário do link: abrir aqui é explícito. */
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <a
        ref={linkRef}
        className="project__cta"
        href={href}
        target="_blank"
        rel="noopener"
        onClick={intercept}
      >
        {label}
        <span className="sr-only">do PagFlow</span>
        <ArrowRight className="project__cta-arrow" strokeWidth={2} />
        <span className="sr-only">(abre em uma nova aba)</span>
      </a>

      <p className="project__notice">
        <InfoIcon />
        <span>{pagflowNotice.hint}</span>
      </p>

      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="pagflow-dialog"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            onClose={() => linkRef.current?.focus({ preventScroll: true })}
            /* Clique no ::backdrop cai no próprio <dialog>: fecha como um X. */
            onClick={(event) => {
              if (event.target === dialogRef.current) close();
            }}
          >
            <div className="pagflow-dialog__inner">
              <div className="pagflow-dialog__head">
                <span className="pagflow-dialog__icon" aria-hidden="true">
                  <MonitorIcon />
                </span>
                <p className="pagflow-dialog__label">{pagflowNotice.label}</p>
                <button
                  className="pagflow-dialog__close icon-btn"
                  type="button"
                  aria-label="Fechar aviso"
                  onClick={close}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <h2 id={titleId}>{pagflowNotice.title}</h2>
              <p id={bodyId}>{pagflowNotice.body}</p>

              <div className="pagflow-dialog__actions">
                <button className="btn btn--primary btn--block" type="button" onClick={openAnyway}>
                  {pagflowNotice.confirm}
                  <ArrowRight />
                </button>
                <button className="btn btn--ghost btn--block" type="button" onClick={close}>
                  {pagflowNotice.cancel}
                </button>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
