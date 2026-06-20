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
