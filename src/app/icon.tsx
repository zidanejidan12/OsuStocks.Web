import { ImageResponse } from "next/og";

// Generated favicon. Next.js serves this at /icon and wires up the
// <link rel="icon"> tag automatically. On-brand pink "O" on near-black,
// mirroring the nav logo mark.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141015",
          color: "#ec4899",
          fontSize: 26,
          fontWeight: 800,
          borderRadius: 7,
        }}
      >
        O
      </div>
    ),
    { ...size },
  );
}
