/**
 * Fonte única de verdade do perfil público.
 * O que aparece repetido no site (e-mail, links, fatos, ferramentas) mora aqui.
 */

export const brand = {
  word: "guto",
  wordAccent: "explorer",
  name: "Gustavo Pinheiro",
  role: "Profissional de dados",
  tagline: "Análise de dados · Processos · Automação",
  year: 2026,
  location: "Cajamar, SP · Brasil",
  email: "gustavo.pinheirodev997@gmail.com",
} as const;

export const socials = {
  linkedin: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gustavo-pinheiro-75278b2a7/",
  },
  medium: { label: "Medium", href: "https://medium.com/@glutox" },
  github: { label: "GitHub", href: "https://github.com/ItsGlutos" },
} as const;

export const nav = [
  { label: "Sobre", href: "#sobre" },
  { label: "Projetos", href: "#projetos" },
  { label: "Contato", href: "#contato" },
] as const;

export type Fact = { label: string; value: string; status?: boolean };

export const facts: Fact[] = [
  { label: "Base", value: brand.location },
  { label: "Foco", value: "Análise de dados e melhoria de processos" },
  { label: "Formação", value: "Tecnólogo em Ciência de Dados · UNICID, em andamento" },
  { label: "Ferramentas", value: "Python · Power BI · Excel" },
  { label: "Idiomas", value: "Português · Inglês" },
  { label: "Status", value: "Aberto a conversas", status: true },
];

export type Pillar = {
  icon: "sheet" | "code" | "cube";
  title: string;
  body: string;
};

export const pillars: Pillar[] = [
  {
    icon: "sheet",
    title: "Análise",
    body: "Investigar o que está por trás do indicador — contexto, causas e limites — antes de transformar um número em conclusão.",
  },
  {
    icon: "code",
    title: "Automação",
    body: "Reduzir etapas manuais e devolver tempo para análise, aprendizado e decisão. Tecnologia como meio, não como fim.",
  },
  {
    icon: "cube",
    title: "Pessoas",
    body: "Empatia e transparência como critério de projeto: quem usa precisa entender o que a ferramenta faz e confiar no que acontece com seus dados.",
  },
];

export const toolbox = [
  "Python",
  "Power BI",
  "Excel avançado",
  "Power Query",
  "ETL",
  "C#",
  "Modelagem de dados",
  "PowerPoint",
  "LGPD",
] as const;

export const heroMeta = [
  { icon: "chart", label: "Análise de dados" },
  { icon: "bars", label: "Power BI" },
  { icon: "cube", label: "Automação" },
] as const;

export const contactCta = [
  {
    label: "Enviar e-mail",
    href: `mailto:${brand.email}`,
    icon: "mail",
    variant: "primary" as const,
    external: false,
  },
  {
    label: "LinkedIn",
    href: socials.linkedin.href,
    icon: "arrow-up-right",
    variant: "ghost" as const,
    external: true,
  },
  {
    label: "Medium",
    href: socials.medium.href,
    icon: "arrow-up-right",
    variant: "ghost" as const,
    external: true,
  },
] as const;
