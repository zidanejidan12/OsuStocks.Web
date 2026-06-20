"use client";

import { useState } from "react";

// Resolve a country's full English name from its ISO 3166-1 alpha-2 code via the
// built-in Intl API (e.g. "FR" -> "France"). Created once; falls back to the code.
const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function countryName(cc: string): string {
  const code = cc.trim().toUpperCase();
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

// Renders a country flag from an ISO 3166-1 alpha-2 code (e.g. "US", "JP").
// Uses flag images (emoji flags don't render on Windows) and falls back to the
// plain code if the image can't load. Plain <img> so no host whitelist is needed.
// Hovering shows the full country name.
export function Flag({
  countryCode,
  className = "",
}: {
  countryCode: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const cc = countryCode.trim().toUpperCase();
  const name = countryName(cc);

  if (cc.length !== 2 || failed) {
    return (
      <span
        title={name}
        className={`font-mono text-xs uppercase tracking-wide text-zinc-300 ${className}`}
      >
        {cc || "??"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${cc.toLowerCase()}.svg`}
      alt={name}
      title={name}
      loading="lazy"
      // Intrinsic 4:3 size hint so the browser reserves space before load
      // (prevents layout shift). CSS classes still control the rendered size.
      width={20}
      height={15}
      onError={() => setFailed(true)}
      className={`inline-block aspect-[4/3] rounded-[3px] object-cover ring-1 ring-zinc-700/50 ${className}`}
    />
  );
}
