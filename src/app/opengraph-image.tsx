import { ImageResponse } from "next/og";

// Generated OpenGraph image for the whole site. Next.js serves this at
// /opengraph-image and wires up the <meta property="og:image"> tags automatically.
export const alt = "OsuStocks — trade osu! players like stocks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1f1a1e 0%, #141015 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", fontSize: 150, fontWeight: 800 }}>
          <span style={{ color: "#ec4899" }}>Osu</span>
          <span>Stocks</span>
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 42, color: "#aa9fa9" }}>
          Trade your favorite osu! players like stocks
        </div>
      </div>
    ),
    { ...size },
  );
}
