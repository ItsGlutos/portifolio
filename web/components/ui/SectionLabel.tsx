import type { ReactNode } from "react";

export function SectionLabel({
  num,
  children,
}: {
  num: string;
  children: ReactNode;
}) {
  return (
    <p className="section-label">
      <span className="chip-num">{num}</span>
      {children}
      <span className="section-label__line" aria-hidden="true" />
    </p>
  );
}
