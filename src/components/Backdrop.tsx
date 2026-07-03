// Fixed, non-interactive decorative layer: two soft ambient glows + fine grain.
// pointer-events-none and fixed so it never triggers scroll repaints.
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-48 right-[-12%] h-[40rem] w-[40rem] rounded-full bg-pink-500/10 blur-[140px]" />
      <div className="absolute bottom-[-25%] left-[-12%] h-[34rem] w-[34rem] rounded-full bg-pink-500/[0.06] blur-[140px]" />
      <div className="grain absolute inset-0 opacity-[0.035]" />
    </div>
  );
}
