import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { products } from "@/data/products";
import { light, palette } from "@/lib/palette";
import { site } from "@/lib/site";
import { ALEPH_PATH, MARK_SIZE, WORDMARK } from "@/components/brand/logoPaths";

export const alt = `${site.name} · ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Cormorant para Satori (acepta WOFF, no WOFF2). Se cachea como texto
 * base64 (serializable): así la imagen se genera estática en el build.
 */
async function loadFonts() {
  "use cache";
  const dir = join(process.cwd(), "node_modules/@fontsource/cormorant/files");
  const files = ["cormorant-latin-300-normal.woff", "cormorant-latin-300-italic.woff"];
  return Promise.all(files.map((f) => readFile(join(dir, f), "base64")));
}

const toArrayBuffer = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

/** La imagen para compartir: el logo, la promesa y las siete luces del día. */
export default async function Image() {
  const [regular, italic] = (await loadFonts()).map(toArrayBuffer);
  const mark = 150;
  const wordWidth = 300;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.papel,
          color: palette.profundo,
          padding: "60px 72px",
          fontFamily: "Cormorant",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width={mark} height={mark} viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}>
            <rect x="6" y="6" width={MARK_SIZE - 12} height={MARK_SIZE - 12} fill="none" stroke={palette.profundo} strokeWidth="12" />
            <path d={ALEPH_PATH} fill={palette.profundo} fillRule="evenodd" />
          </svg>
          <svg width={wordWidth} height={(wordWidth * WORDMARK.height) / WORDMARK.width} viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`}>
            {WORDMARK.letters.map((d, i) => (
              <path key={i} d={d} fill={palette.profundo} fillRule="evenodd" />
            ))}
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.9, letterSpacing: -3 }}>
          <span>La belleza a tu</span>
          <span style={{ fontStyle: "italic" }}>propio ritmo.</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {products.map((p) => (
            <div key={p.slug} style={{ flex: 1, height: 18, background: light[p.slug] }} />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: regular, weight: 300, style: "normal" },
        { name: "Cormorant", data: italic, weight: 300, style: "italic" },
      ],
    },
  );
}
