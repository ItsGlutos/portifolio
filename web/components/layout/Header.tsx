"use client";

import { useEffect, useRef, useState } from "react";
import { brand, nav, socials } from "@/content/profile";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { ArrowUpRight, ChevronRight, CloseIcon, MenuIcon } from "@/components/ui/icons";
import Magnet from "@/components/reactbits/Magnet";
import StarBorder from "@/components/reactbits/StarBorder";

const SECTION_IDS = ["sobre", "projetos", "contato"] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /* Header denso depois de 8px de rolagem. */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 8);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll spy: marca a seção visível no menu. */
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Menu mobile: trava rolagem, isola o resto da página e devolve o foco.
     No iOS, `overflow: hidden` no body não trava nada: o body vira fixo com
     `top: -scrollY` (o CSS de `.no-scroll` cuida do resto) e a posição volta
     no fechamento, sem pular para o topo. */
  useEffect(() => {
    if (!open) return;

    const main = document.getElementById("conteudo");
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const scrollY = window.scrollY;

    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    document.body.style.top = scrollY ? `-${scrollY}px` : "0px";
    document.body.classList.add("no-scroll");

    const first = navRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (navRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onResize = () => {
      if (window.innerWidth > 720) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.classList.remove("no-scroll");
      document.body.style.top = "";
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, [open]);

  return (
    <>
      <header className={cn("site-header", scrolled && "is-scrolled", open && "is-menu-open")}>
        <div className="container header__inner">
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
            <span className="brand__dot" aria-hidden="true" />
          </a>

          <nav className="nav" aria-label="Navegação principal">
            {nav.map((item) => (
              <a
                key={item.href}
                className="nav__link"
                href={item.href}
                aria-current={active === item.href ? "true" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <span className="status">
              <span className="status__dot" aria-hidden="true" />
              Disponível
            </span>

            <Magnet
              wrapperClassName="header__magnet"
              padding={80}
              magnetStrength={2.6}
              maxOffset={6}
              spring={{ stiffness: 200, damping: 18 }}
            >
              <StarBorder
                as="a"
                className="btn btn--primary header__cta"
                href="#contato"
                radius={12}
                thickness={1}
                color="#d8f5ff"
                trailColor="#55ceff"
                duration={4.2}
                trailLength={0.28}
                stars={1}
                glow={0.55}
                hover="reveal"
                sparkle
                theme="dark"
                backgroundColor="linear-gradient(180deg, #2c77c6, #23629f)"
                textColor="#ffffff"
                borderColor="rgba(255, 255, 255, 0.18)"
              >
                Vamos conversar
                <ArrowUpRight />
              </StarBorder>
            </Magnet>

            <button
              ref={toggleRef}
              className="icon-btn menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <MenuIcon className="icon-menu" />
              <CloseIcon className="icon-close" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn("mobile-nav", open && "is-open")}
        id="mobile-nav"
        ref={navRef}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <nav aria-label="Navegação mobile">
          {nav.map((item) => (
            <a key={item.href} className="mobile-nav__link" href={item.href}>
              {item.label}
              <ChevronRight />
            </a>
          ))}
          <a
            className="mobile-nav__link"
            href={socials.linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
            <ArrowUpRight />
          </a>
          <a className="btn btn--primary btn--block" href={`mailto:${brand.email}`}>
            Vamos conversar
          </a>

          <div className="mobile-nav__foot">
            <p>{brand.tagline}</p>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </div>
        </nav>
      </div>
    </>
  );
}
