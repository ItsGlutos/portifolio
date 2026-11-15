import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand } from "@/content/profile";

/**
 * Imagem social em `/og.png`.
 *
 * A convenção `opengraph-image` geraria `/opengraph-image` (sem extensão), e
 * host estático serve arquivo sem extensão como `application/octet-stream` —
 * WhatsApp, LinkedIn e Facebook recusam a prévia. Um route handler em
 * `app/og.png/` produz um `.png` de verdade, com o content-type certo em
 * qualquer host (Vercel, GitHub Pages, Netlify, Cloudflare).
 */
export const dynamic = "force-static";

export async function GET() {
  const font = await readFile(join(process.cwd(), "lib/fonts/SpaceGrotesk-700.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(160deg, #091522 0%, #0d1f33 55%, #11263e 100%)",
          color: "#e8f0fe",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -180,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "2px solid rgba(85,206,255,0.28)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 140,
            width: 300,
            height: 300,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(85,206,255,0.20), rgba(85,206,255,0))",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#112236",
              border: "1px solid #1b3a5c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 24,
                height: 24,
                borderRadius: 9999,
                border: "2px solid #55ceff",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: "#8fe0ff",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: -1,
              color: "#e8f0fe",
            }}
          >
            {brand.word}
            <span style={{ color: "#7f9cba" }}>{brand.wordAccent}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8aa6c4",
            }}
          >
            Portfólio · 2026
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            <span>Entendo o fluxo.</span>
            <span>Leio os dados.</span>
            <span style={{ display: "flex", flexDirection: "row" }}>
              <span>Apoio&nbsp;</span>
              <span style={{ color: "#55ceff" }}>decisões</span>
              <span>.</span>
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#94b4d4",
            borderTop: "1px solid rgba(85,206,255,0.18)",
            paddingTop: 24,
          }}
        >
          <span>{brand.name}</span>
          <span style={{ color: "#55ceff" }}>análise de dados · processos · automação</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Space Grotesk",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
