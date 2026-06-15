// Vendor-agnostic analytics seam.
//
// App code calls `identify` / `track` / `reset` from here; the concrete vendor
// is wired in ONE place so call sites never change. The only vendor wired up
// today is PostHog.
//
// Analytics is OPTIONAL: it stays off unless PostHog credentials are provided
// via `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`). Without
// a key the seam no-ops, sends nothing, and never even downloads the PostHog
// bundle (it is dynamically imported only after `init` confirms credentials).
//
// `init` runs once from `instrumentation-client.ts`; see TASKS.md.

import type { PostHog } from "posthog-js";

type Traits = Record<string, string | number | boolean | null | undefined>;
type EventProps = Record<string, unknown>;

const isDev = process.env.NODE_ENV !== "production";
const DEFAULT_HOST = "https://us.i.posthog.com";

let client: PostHog | null = null;
let disabled = false;
// Buffers calls that land between `init` starting and the vendor finishing its
// async load, so an early `identify` is never dropped. Drained on load.
const queue: Array<(ph: PostHog) => void> = [];

function debug(method: string, ...args: unknown[]): void {
  if (isDev && typeof window !== "undefined") {
    console.debug(`[analytics] ${method}`, ...args);
  }
}

function readConfig(): { key: string; host: string } | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return null;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_HOST;
  return { key, host };
}

/** Forward to the live client, buffer until it loads, or drop if disabled. */
function withClient(fn: (ph: PostHog) => void): void {
  if (client) fn(client);
  else if (!disabled) queue.push(fn);
}

/**
 * Initialize analytics. Call once, client-side, from instrumentation-client.ts.
 * No-ops (and loads nothing) unless PostHog credentials are configured, which
 * is what makes analytics optional.
 */
export function init(): void {
  if (typeof window === "undefined" || client !== null || disabled) return;

  const config = readConfig();
  if (config === null) {
    disabled = true;
    queue.length = 0;
    debug("disabled — set NEXT_PUBLIC_POSTHOG_KEY to enable");
    return;
  }

  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(config.key, {
        api_host: config.host,
        // Capture the initial load and every App Router navigation (SPA
        // pageviews ride on the History API, which this mode hooks).
        capture_pageview: "history_change",
        capture_pageleave: true,
        person_profiles: "identified_only",
        debug: isDev,
      });
      client = posthog;
      for (const fn of queue) fn(posthog);
      queue.length = 0;
      debug("initialized", config.host);
    })
    .catch((err) => {
      disabled = true;
      queue.length = 0;
      debug("init failed", err);
    });
}

/** Tie subsequent events to a known user. Safe to call on every load. */
export function identify(distinctId: string, traits?: Traits): void {
  debug("identify", distinctId, traits);
  withClient((ph) => ph.identify(distinctId, traits));
}

/** Record a product event (e.g. "trade_executed"). */
export function track(event: string, props?: EventProps): void {
  debug("track", event, props);
  withClient((ph) => ph.capture(event, props));
}

/** Clear identity on logout / auth loss so later events aren't misattributed. */
export function reset(): void {
  debug("reset");
  withClient((ph) => ph.reset());
}
