import { Avatar } from "@/components/ui/Avatar";

// Single source of truth for the sponsor credit, reused across the footer, the
// live ticker, the topbar, and the landing hero. Links to the sponsor's osu!
// profile; the avatar comes from osu!'s CDN (degrades to an initial on 404).
export const SPONSOR = { id: 15640966, name: "Raids" };

type Props = {
  /** Wrapper sizing/colour for the surface, e.g. "text-xs text-zinc-600". */
  className?: string;
  /**
   * Controls the visible "Sponsored by" prefix. Pass "hidden" on tight surfaces
   * to render just the chip — the link keeps the full phrase via aria-label.
   */
  labelClassName?: string;
  avatarSize?: "xs" | "sm";
};

export function SponsorCredit({
  className = "",
  labelClassName = "",
  avatarSize = "xs",
}: Props) {
  const label = `Sponsored by ${SPONSOR.name}`;
  return (
    <span className={`flex items-center gap-2 whitespace-nowrap ${className}`}>
      <span className={labelClassName}>Sponsored by</span>
      <a
        href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        aria-label={`${label} — osu! profile (opens in a new tab)`}
        className="group inline-flex items-center gap-1.5 font-medium text-zinc-400 transition-colors hover:text-pink-300"
      >
        <Avatar
          src={`https://a.ppy.sh/${SPONSOR.id}`}
          name={SPONSOR.name}
          size={avatarSize}
        />
        {SPONSOR.name}
        <span
          aria-hidden="true"
          className="text-zinc-600 transition-colors group-hover:text-pink-300"
        >
          &#8599;
        </span>
      </a>
    </span>
  );
}

/**
 * Prominent boxed sponsor credit — used on the landing hero (above the live-movers
 * panel) and the About page. Shares the {@link SPONSOR} source of truth with the
 * inline {@link SponsorCredit} used in the footer/ticker. Server-compatible (no
 * hooks; the unicode arrow keeps it out of the client bundle), so it renders inside
 * the server-rendered About page. The whole card links to the sponsor's osu! profile.
 */
export function SponsorCard({ className = "" }: { className?: string }) {
  const label = `Sponsored by ${SPONSOR.name}`;
  return (
    <a
      href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — osu! profile (opens in a new tab)`}
      className={`group block relative overflow-hidden rounded-2xl border border-pink-500/10 bg-gradient-to-r from-pink-500/[0.04] via-zinc-950/40 to-transparent p-5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-pink-500/40 hover:bg-zinc-900/30 hover:shadow-[0_0_40px_rgba(236,72,153,0.12)] ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/90 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
            Core Sponsor
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            src={`https://a.ppy.sh/${SPONSOR.id}`}
            name={SPONSOR.name}
            size="md"
            className="relative ring-2 ring-zinc-950 bg-zinc-950"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black tracking-tight text-zinc-100 transition-colors group-hover:text-pink-200">
            {SPONSOR.name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Supporting osu! virtual stock market
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-500 transition-all duration-300 group-hover:border-pink-500/30 group-hover:text-pink-300 group-hover:translate-x-0.5">
          <span aria-hidden="true" className="text-sm font-semibold">&#8599;</span>
        </div>
      </div>
    </a>
  );
}
