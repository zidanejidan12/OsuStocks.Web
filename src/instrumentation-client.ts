// Runs on the client after the document loads but before React hydrates — the
// right moment to bring analytics up so it captures the initial pageview.
//
// `init` no-ops unless PostHog credentials are configured, so this file is inert
// (and pulls in no vendor code) when analytics is disabled. SPA pageviews on
// subsequent navigations are handled inside the seam via PostHog's
// `capture_pageview: 'history_change'`, so no router hook is needed here.

import { init } from "@/lib/analytics";

init();
