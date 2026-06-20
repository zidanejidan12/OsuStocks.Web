import type { NextConfig } from "next";

// Where the Next.js server forwards API calls. This is a SERVER-ONLY variable
// (no NEXT_PUBLIC_ prefix), so the real backend origin is never shipped to the
// browser or inlined into the client bundle. The browser only ever talks to
// this app's own origin at /api/v1/* — the rewrite below proxies it onward.
const apiTarget =
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // back-compat; prefer API_PROXY_TARGET
  "http://localhost:5152";

const nextConfig: NextConfig = {
  // Rewrite the barrel `import { X } from "@phosphor-icons/react"` to per-icon
  // module paths so only the icons actually used are bundled (and dev/build
  // compiles stay fast). Phosphor isn't in Next's default optimize list.
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
