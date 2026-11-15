import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  strokeWidth?: number;
};

type StrokeIconProps = IconProps & {
  children: ReactNode;
};

/** Base dos ícones de traço: sempre decorativos (aria-hidden). */
function StrokeIcon({ children, strokeWidth = 1.8, ...props }: StrokeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M7 17L17 7M8 7h9v9" />
    </StrokeIcon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </StrokeIcon>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 12h13M12 6l6 6-6 6" />
    </StrokeIcon>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 6l6 6-6 6" />
    </StrokeIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </StrokeIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </StrokeIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </StrokeIcon>
  );
}

export function ChartLineIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.6} {...props}>
      <path d="M4 19V5M4 19h16M8 15l4-5 3 3 5-7" />
    </StrokeIcon>
  );
}

export function BarsIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.6} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 16v-4M12 16V8M17 16v-6" />
    </StrokeIcon>
  );
}

export function CubeIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.6} {...props}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </StrokeIcon>
  );
}

export function SheetIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.6} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </StrokeIcon>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.6} {...props}>
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 5l-3 14" />
    </StrokeIcon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    </StrokeIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </StrokeIcon>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </StrokeIcon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.7} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </StrokeIcon>
  );
}

/** Marca do Medium (preenchida, não é ícone de traço). */
export function MediumMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M2 4.5h8.6v15H2z" opacity=".55" />
      <path fill="currentColor" d="M13.2 4.5h4.3v15h-4.3z" />
      <path fill="currentColor" d="M19.9 4.5h2.1v15h-2.1z" opacity=".75" />
    </svg>
  );
}
