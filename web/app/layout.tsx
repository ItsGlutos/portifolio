import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { brand, socials } from "@/content/profile";
import { absoluteUrl, isPreview } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { RevealRoot } from "@/components/motion/RevealRoot";
import { MotionRoot } from "@/components/motion/MotionRoot";

const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SpaceGrotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/SpaceGrotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
  fallback: ["Cascadia Code", "Consolas", "monospace"],
});

const description =
  "gutoexplorer, o portfólio de Gustavo Pinheiro: profissional de dados com foco em análise, melhoria de processos e apoio à decisão. Python, Power BI, automação e UX.";

/* Tudo absoluto e com basePath: canonical, OG e sitemap não dependem do host
   nem do diretório em que o site foi publicado. */
const canonicalUrl = absoluteUrl("/");
const socialImage = absoluteUrl("/og.png");

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: "gutoexplorer — Portfólio de Gustavo Pinheiro",
    template: "%s — gutoexplorer",
  },
  description,
  applicationName: "gutoexplorer",
  authors: [{ name: brand.name }],
  creator: brand.name,
  keywords: [
    "análise de dados",
    "portfólio",
    "Python",
    "Power BI",
    "automação",
    "Power Query",
    "ETL",
    "LGPD",
    "UX",
    "Gustavo Pinheiro",
  ],
  /* Prévia (Pages ou deployment da Vercel) não emite canonical: ela não é a
     versão definitiva e não deve competir no índice com o site de verdade. */
  alternates: isPreview ? undefined : { canonical: canonicalUrl },
  openGraph: {
    type: "profile",
    locale: "pt_BR",
    url: canonicalUrl,
    siteName: "gutoexplorer",
    title: "gutoexplorer — Portfólio de Gustavo Pinheiro",
    description:
      "Profissional de dados com perfil analítico. Investigo indicadores, entendo processos e uso tecnologia para apoiar decisões melhores.",
    images: [
      {
        url: socialImage,
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "gutoexplorer — portfólio de Gustavo Pinheiro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gutoexplorer — Portfólio de Gustavo Pinheiro",
    description:
      "Profissional de dados com perfil analítico, foco em análise, melhoria de processos e apoio à decisão.",
    images: [socialImage],
  },
  robots: isPreview
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
      },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#091522",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  /* Borda a borda: o CSS usa as áreas seguras (notch, barra de gestos). */
  viewportFit: "cover",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: brand.name,
  alternateName: "gutoexplorer",
  url: absoluteUrl("/"),
  jobTitle: brand.role,
  email: `mailto:${brand.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cajamar",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  sameAs: [socials.linkedin.href, socials.medium.href, socials.github.href],
  knowsAbout: [
    "Análise de dados",
    "Power BI",
    "Python",
    "Automação de processos",
    "ETL",
    "Power Query",
    "LGPD",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "gutoexplorer",
  url: absoluteUrl("/"),
  inLanguage: "pt-BR",
  author: { "@type": "Person", name: brand.name },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} has-reveal`}
    >
      <body>
        <noscript>
          {/* Sem JS, nada fica escondido esperando a revelação. */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>

        <SkyCanvas />

        <div className="page">
          <ScrollProgress />
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
        </div>

        <RevealRoot />
        <MotionRoot />

        <script
          type="application/ld+json"
          // JSON-LD é estático e controlado por nós, não por entrada do usuário.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
