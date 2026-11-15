"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import Magnet from "@/components/reactbits/Magnet";
import { cn } from "@/lib/cn";

type MagneticLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  /** Classe extra no invólucro do ímã (não no link). */
  wrapperClassName?: string;
  /** Quanto menor, mais o botão anda atrás do ponteiro. */
  strength?: number;
};

/**
 * CTA com o Magnet do React Bits: o link é puxado na direção do ponteiro
 * com física de mola e volta ao lugar quando o campo termina. O componente
 * cuida de toque e de `prefers-reduced-motion`; o link continua sendo um
 * `<a>` normal para foco, teclado e leitores de tela.
 */
export function MagneticLink({
  children,
  className,
  wrapperClassName,
  strength = 2.4,
  ...props
}: MagneticLinkProps) {
  return (
    <Magnet
      wrapperClassName={cn("magnet-link", wrapperClassName)}
      padding={96}
      magnetStrength={strength}
      maxOffset={7}
      spring={{ stiffness: 190, damping: 17 }}
    >
      <a className={className} {...props}>
        {children}
      </a>
    </Magnet>
  );
}
