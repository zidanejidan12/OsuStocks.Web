"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  WarningCircle,
  Info,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { spring } from "@/lib/motion";

type ToastTone = "success" | "danger" | "info";

interface ToastOptions {
  title: string;
  message?: string;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. Defaults to 5000; pass 0 to keep it sticky. */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "message">> {
  id: number;
  message?: string;
}

interface ToastContextValue {
  /** Show a toast. Returns its id (so callers can dismiss it early). */
  notify: (opts: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { ring: string; icon: string; Icon: PhosphorIcon }> = {
  success: { ring: "ring-emerald-500/30", icon: "text-emerald-400", Icon: CheckCircle },
  danger: { ring: "ring-rose-500/30", icon: "text-rose-400", Icon: WarningCircle },
  info: { ring: "ring-pink-500/30", icon: "text-pink-400", Icon: Info },
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Track timers so an early manual dismiss clears its pending auto-dismiss.
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ title, message, tone = "info", duration = 5000 }: ToastOptions) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, title, message, tone, duration }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { ring, icon, Icon } = TONE_STYLES[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={spring}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/95 p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85)] ring-1 ring-inset backdrop-blur-md ${ring}`}
                // Errors interrupt (assertive); success/info wait their turn (polite).
                role={t.tone === "danger" ? "alert" : "status"}
                aria-live={t.tone === "danger" ? "assertive" : "polite"}
              >
                <Icon size={18} weight="bold" className={`mt-0.5 shrink-0 ${icon}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-100">{t.title}</div>
                  {t.message && (
                    <p className="mt-0.5 text-sm text-zinc-400">{t.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="-m-1 shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  <X size={15} weight="bold" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
