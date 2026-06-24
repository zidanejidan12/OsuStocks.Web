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
   * to render just the chip; the link keeps the full phrase via aria-label.
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
        aria-label={`${label}. osu! profile (opens in a new tab)`}
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
 * Prominent boxed sponsor credit, used on the landing hero (above the live-movers
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
      aria-label={`${label}. osu! profile (opens in a new tab)`}
      className={`group block rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.8)] transition-colors hover:border-pink-500/40 hover:bg-zinc-900/70 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          Sponsored by
        </span>
        <span aria-hidden="true" className="text-pink-400/60">
          &#10084;
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar
          src={`https://a.ppy.sh/${SPONSOR.id}`}
          name={SPONSOR.name}
          size="md"
        />
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-zinc-100 transition-colors group-hover:text-pink-200">
            {SPONSOR.name}
          </div>
          <div className="text-xs text-zinc-500">osu! profile &#8599;</div>
        </div>
        <span
          aria-hidden="true"
          className="ml-auto text-zinc-600 transition-colors group-hover:text-pink-300"
        >
          &#8599;
        </span>
      </div>
    </a>
  );
}
