/**
 * Projetos como dados tipados. Os cartões, o filtro e os contadores saem
 * todos daqui — número digitado à mão não existe mais.
 */

export type Category = "dados" | "automacao";

type BaseProject = {
  slug: string;
  kicker: string;
  title: string;
  description: string;
  tags: readonly string[];
  year: string;
  categories: readonly Category[];
};

export type ShowcaseProject = BaseProject & {
  kind: "showcase";
  cta: { label: string; href: string; external: boolean };
  meta: string;
};

export type ReadingProject = BaseProject & {
  kind: "reading";
  readMinutes: number;
  href: string;
  art: "merge" | "graph";
};

export type StandardProject = BaseProject & {
  kind: "standard";
  art: "kpi" | "automation";
  status: "Privado";
  foot: string;
};

export type Project = ShowcaseProject | ReadingProject | StandardProject;

export const projects: readonly Project[] = [
  {
    kind: "showcase",
    slug: "pagflow",
    kicker: "Automação · Case em destaque",
    title: "PagFlow",
    description:
      "Um app desktop que consolida diversas faturas em um único relatório. Foi desenhado para ser usado por quem não programa: processamento local, sem coleta externa e uma interface ajustada a partir do feedback de usuários reais. A versão interativa replica a experiência completa, sem operar arquivos.",
    tags: ["Python", "UX", "Privacidade", "Automação"],
    year: "2026",
    categories: ["automacao"],
    cta: {
      label: "Abrir o app interativo",
      href: "pagflow/",
      external: true,
    },
    meta: "12 temas · sem instalação",
  },
  {
    kind: "reading",
    slug: "power-query-empatia",
    kicker: "Publicação · Medium",
    title:
      "Como a empatia guiou a transformação da minha equipe com o Power Query",
    description:
      "Três horas por dia iam embora em extrair, tratar e carregar dados. A automação em Power Query encurtou o trabalho repetitivo — mas o que destravou a adoção foi ensinar em conjunto, começando por quem mais travava com tecnologia.",
    tags: ["Power Query", "UX", "ETL", "Times"],
    year: "2026",
    categories: ["dados"],
    readMinutes: 5,
    href: "https://medium.com/@glutox/como-a-empatia-guiou-a-transforma%C3%A7%C3%A3o-da-minha-equipe-com-o-power-query-0b5a5a5043d4",
    art: "merge",
  },
  {
    kind: "reading",
    slug: "ia-generativa-nao-e-neutra",
    kicker: "Publicação · Medium",
    title:
      "IA generativa não é neutra. E você, como desenvolvedor, tem responsabilidade nisso",
    description:
      "Modelos não nascem neutros: aprendem com dados que carregam o viés humano. Do COMPAS ao redlining do Meta, o artigo percorre casos reais e defende a ética como requisito técnico — documentação, rastreabilidade e métricas separadas por grupo social.",
    tags: ["IA generativa", "Ética", "LGPD", "Análise de dados"],
    year: "2026",
    categories: ["dados"],
    readMinutes: 5,
    href: "https://medium.com/@glutox/ia-generativa-n%C3%A3o-%C3%A9-neutra-e-voc%C3%AA-como-desenvolvedor-tem-responsabilidade-nisso-9f51881732b6",
    art: "graph",
  },
  {
    kind: "standard",
    slug: "gestao-de-kpi",
    kicker: "Qualidade · Indicadores logísticos",
    title: "Gestão de KPI",
    description:
      "Resultados abaixo da meta motivaram uma investigação, não uma conclusão. Ouvi as transportadoras com os menores indicadores, entendi as condições das rotas e levei a contestação dos valores, tratativa interna e maior cautela e limpeza nos dados.",
    tags: ["Análise de indicadores", "Logística", "Colaboração"],
    year: "2026",
    categories: ["dados"],
    art: "kpi",
    status: "Privado",
    foot: "Case sob demanda",
  },
  {
    kind: "standard",
    slug: "rotina-financeira",
    kicker: "Processos",
    title: "Rotina Financeira",
    description:
      "Otimização de fluxos financeiros com automações de apoio à equipe. O trabalho envolveu entender a rotina, simplificar etapas e reduzir o esforço manual para que o time tivesse mais tempo de acompanhar e analisar o que importava.",
    tags: ["Automação", "Processos", "Suporte à equipe"],
    year: "2024–2026",
    categories: ["automacao"],
    art: "automation",
    status: "Privado",
    foot: "Experiência profissional",
  },
];

/**
 * Aviso de mobile da prévia do PagFlow.
 *
 * O app real é uma janela PyQt6 de 1280 × 960. A réplica escala para caber em
 * qualquer tela, mas a 390 px de largura fica em ~27%: o texto deixa de ser
 * legível e os controles ficam fora de alcance. O aviso aparece no cartão e,
 * no celular, num diálogo antes de abrir — sem esconder a demo de ninguém.
 */
export const pagflowNotice = {
  hint: "Feito para desktop — no celular a prévia pode apresentar erros.",
  label: "Aviso · prévia desktop",
  title: "O PagFlow é um app de desktop",
  body: "A prévia reproduz uma janela de 1280 × 960. No celular ela fica reduzida e pode apresentar erros: textos ilegíveis, controles fora de alcance e rolagem lateral. Para avaliar a experiência completa, abra em um computador.",
  confirm: "Abrir no celular",
  cancel: "Agora não",
} as const;

export type FilterKey = "todos" | Category;

export const filters: readonly { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "dados", label: "Dados" },
  { key: "automacao", label: "Automação" },
];

/** Contagem derivada: impossível divergir dos cartões. */
export function projectCount(filter: FilterKey): number {
  return filter === "todos"
    ? projects.length
    : projects.filter((project) => project.categories.includes(filter)).length;
}

export function matchesFilter(project: Project, filter: FilterKey): boolean {
  return filter === "todos" || project.categories.includes(filter);
}

export function padIndex(position: number): string {
  return String(position + 1).padStart(2, "0");
}
