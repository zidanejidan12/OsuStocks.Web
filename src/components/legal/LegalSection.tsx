"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

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
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3.5 p-5 sm:p-6 rounded-2xl border border-zinc-900 bg-zinc-950/15 hover:border-pink-500/10 hover:bg-zinc-950/30 transition-all duration-300"
    >
      <h2 className="text-base font-extrabold tracking-tight text-zinc-100 flex items-center gap-2.5">
        <span className="w-1 h-3.5 bg-pink-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
        {title}
      </h2>
      <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-400 [&_a:hover]:text-pink-300 [&_a]:text-pink-400 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </motion.section>
  );
}
