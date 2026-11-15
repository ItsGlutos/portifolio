/**
 * Prefixo de assets para hospedagem em subpasta (GitHub Pages de projeto).
 * Defina NEXT_PUBLIC_BASE_PATH (ex.: /portifolio) no build; vazio na raiz.
 *
 * É usado nos `src`/`href` dos componentes (inclusive os de cliente), por isso
 * a variável precisa ser pública e o valor entra no bundle no build.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";

export function asset(path: string): string {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
