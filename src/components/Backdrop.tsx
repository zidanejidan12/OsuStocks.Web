import { OsuAuroraBackground } from "@/components/ui/OsuAuroraBackground";

export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <OsuAuroraBackground />
      <div className="grain absolute inset-0 opacity-[0.035]" />
    </div>
  );
}
