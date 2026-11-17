"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ProjectView } from "@/content/projects";

/**
 * As duas leituras do PagFlow: gerencial (padrão) e técnica.
 *
 * A troca acontece no próprio cartão, sem sair da home. Os dois textos ficam
 * no HTML — o inativo só é escondido visualmente — para o SEO indexar as duas
 * explicações e para a altura do painel não pular entre uma e outra. A última
 * escolha é lembrada entre visitas; se o armazenamento estiver bloqueado, a
 * visão gerencial continua sendo o padrão.
 */

type ViewKey = "managerial" | "technical";

const ORDER: readonly ViewKey[] = ["managerial", "technical"];
const STORAGE_KEY = "pagflow:view";

function isViewKey(value: string | null): value is ViewKey {
  return value === "managerial" || value === "technical";
}

export function PagflowViews({ views }: { views: Record<ViewKey, ProjectView> }) {
  const [active, setActive] = useState<ViewKey>("managerial");
  const uid = useId();
  const tabRefs = useRef<Record<ViewKey, HTMLButtonElement | null>>({
    managerial: null,
    technical: null,
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isViewKey(saved)) setActive(saved);
    } catch {
      /* Armazenamento bloqueado: a visão gerencial segue como padrão. */
    }
  }, []);

  function select(key: ViewKey) {
    setActive(key);
    try {
      window.localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* Sem persistência: a troca continua funcionando nesta visita. */
    }
  }

  function focusTab(index: number) {
    const key = ORDER[index];
    if (!key) return;
    select(key);
    tabRefs.current[key]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((index + 1) % ORDER.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((index - 1 + ORDER.length) % ORDER.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(ORDER.length - 1);
    }
  }

  return (
    <div className="project__views">
      <div
        className="project__viewtabs"
        role="tablist"
        aria-label="Escolha o tipo de explicação do PagFlow"
      >
        {ORDER.map((key, index) => {
          const selected = active === key;
          return (
            <button
              key={key}
              ref={(node) => {
                tabRefs.current[key] = node;
              }}
              id={`${uid}-tab-${key}`}
              type="button"
              role="tab"
              className="project__viewtab"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {views[key].label}
            </button>
          );
        })}
      </div>

      <div className="project__viewpanels">
        {ORDER.map((key) => {
          const selected = active === key;
          return (
            <div
              key={key}
              id={`${uid}-panel-${key}`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${key}`}
              aria-hidden={!selected}
              data-active={selected}
              tabIndex={selected ? 0 : -1}
              className="project__viewpanel"
            >
              <p className="project__desc">{views[key].description}</p>
              <div className="project__tags">
                {views[key].tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
