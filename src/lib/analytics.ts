// Vendor-agnostic analytics seam.
//
// App code calls `identify` / `track` / `reset` from here; the concrete vendor
// (PostHog, Umami, …) gets wired in ONE place once chosen, so call sites never
// change. Until then these no-op in production and log in development.
// See the analytics groundwork task in TASKS.md.

type Traits = Record<string, string | number | boolean | null | undefined>;
type EventProps = Record<string, unknown>;

const isDev = process.env.NODE_ENV !== "production";

function debug(method: string, ...args: unknown[]): void {
  if (isDev && typeof window !== "undefined") {
    console.debug(`[analytics] ${method}`, ...args);
  }
}

/** Tie subsequent events to a known user. Safe to call on every load. */
export function identify(distinctId: string, traits?: Traits): void {
  debug("identify", distinctId, traits);
  // TODO(analytics): forward to the vendor, e.g. posthog.identify(distinctId, traits)
}

/** Record a product event (e.g. "trade_executed"). */
export function track(event: string, props?: EventProps): void {
  debug("track", event, props);
  // TODO(analytics): e.g. posthog.capture(event, props)
}

/** Clear identity on logout / auth loss so later events aren't misattributed. */
export function reset(): void {
  debug("reset");
  // TODO(analytics): e.g. posthog.reset()
}
