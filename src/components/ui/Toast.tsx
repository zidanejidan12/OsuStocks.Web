"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
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
  /** Auto-dismiss delay in ms. Defaults to a readable floor; pass 0 to keep it sticky. */
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

const TONE_STYLES: Record<
  ToastTone,
  { ring: string; icon: string; Icon: PhosphorIcon }
> = {
  success: { ring: "ring-emerald-500/30", icon: "text-emerald-400", Icon: CheckCircle },
  danger: { ring: "ring-rose-500/30", icon: "text-rose-400", Icon: WarningCircle },
  // Info gets its own hue (sky) so it reads as informational rather than brand.
  info: { ring: "ring-sky-500/30", icon: "text-sky-400", Icon: Info },
};

// Minimum on-screen time so a toast is readable, then add reading time scaled by
// the message length (~50ms/char) on top of the floor.
const MIN_DURATION = 4000;
function resolveDuration(duration: number | undefined, title: string, message?: string) {
  if (duration === 0) return 0; // sticky
  if (typeof duration === "number") return Math.max(duration, MIN_DURATION);
  const chars = title.length + (message?.length ?? 0);
  return Math.max(MIN_DURATION, Math.min(12000, 2000 + chars * 50));
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(({ title, message, tone = "info", duration }: ToastOptions) => {
    const id = ++nextId;
    setToasts((prev) => [
      ...prev,
      { id, title, message, tone, duration: resolveDuration(duration, title, message) },
    ]);
    return id;
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const { id, title, message, tone, duration } = toast;
  const { ring, icon, Icon } = TONE_STYLES[tone];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // (Re)start the countdown from the full duration. Hovering/focusing pauses and
  // resets it so the toast stays put while the user is engaging with it.
  const start = useCallback(() => {
    clear();
    if (duration > 0) {
      timer.current = setTimeout(() => onDismiss(id), duration);
    }
  }, [clear, duration, id, onDismiss]);

  useEffect(() => {
    start();
    return clear;
  }, [start, clear]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onDismiss(id);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={spring}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/95 p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85)] ring-1 ring-inset backdrop-blur-md ${ring}`}
      // Errors interrupt (assertive); success/info wait their turn (polite).
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      tabIndex={-1}
      onMouseEnter={clear}
      onMouseLeave={start}
      onFocusCapture={clear}
      onBlurCapture={start}
      onKeyDown={onKeyDown}
    >
      <Icon size={18} weight="bold" className={`mt-0.5 shrink-0 ${icon}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-100">{title}</div>
        {message && <p className="mt-0.5 text-sm text-zinc-400">{message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
        className="-m-1 shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
      >
        <X size={15} weight="bold" />
      </button>
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
