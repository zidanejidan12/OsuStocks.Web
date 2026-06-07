import type { ReactNode } from "react";

// Consistent typography for the legal pages (no typography plugin needed).
// Nested <a>, <strong>, and <ul> are styled via arbitrary variants.
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400 [&_a:hover]:text-pink-300 [&_a]:text-pink-400 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
