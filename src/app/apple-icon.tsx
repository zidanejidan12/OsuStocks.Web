import { ImageResponse } from "next/og";

// Generated Apple touch icon (home-screen). Next.js serves this at /apple-icon
// and wires up the <link rel="apple-touch-icon"> tag automatically.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
          color: "#ec4899",
          fontSize: 132,
          fontWeight: 800,
        }}
      >
        O
      </div>
    ),
    { ...size },
  );
}
