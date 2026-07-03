"use client";

import { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

// Low-saturation tints keyed off the name, so the initial-fallbacks aren't
// monotonous while still sitting in the dark theme. (These are what render until
// the API supplies an avatarUrl.)
const TINTS = [
  "bg-pink-500/15 text-pink-300",
  "bg-violet-500/15 text-violet-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-amber-500/15 text-amber-300",
  "bg-sky-500/15 text-sky-300",
  "bg-rose-500/15 text-rose-300",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return TINTS[Math.abs(hash) % TINTS.length];
}

type Props = {
  /** osu! profile image URL. Falls back to the player's initial when absent or on load error. */
  src?: string | null;
  /** Player name — drives the alt text and the initial fallback. */
  name: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ src, name, size = "md", className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const base = `${SIZES[size]} shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-700/60 ${className}`;

  if (src && !failed) {
    return (
      // Avatars come from osu!'s CDN (a.ppy.sh) and can redirect to arbitrary
      // hosts; a plain <img> tolerates any host and degrades to the initial
      // fallback on error. next/image would need every host whitelisted in
      // next.config and would hard-error on an unconfigured one.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${base} bg-zinc-800 object-cover`}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      role="img"
      aria-label={name}
      className={`${base} grid place-items-center font-semibold ${tintFor(name)}`}
    >
      {initial}
    </span>
  );
}
