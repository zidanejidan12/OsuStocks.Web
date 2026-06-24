// The osu! coin currency glyph. Placeholder for now. Swap public/osu-coin.svg
// (or this component's src) for the real coin art later. Sizes to 1em by default
// so it scales with the surrounding text.
export function Coin({
  size = "h-[1em] w-[1em]",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/osu-coin.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`inline-block shrink-0 align-[-0.18em] ${size} ${className}`}
    />
  );
}
