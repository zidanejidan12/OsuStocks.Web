// Optional, operator-supplied legal details. Both are read from the
// environment so the deploying operator can fill them in without code changes;
// the legal pages render the related bits only when a value is present.
//
// NOTE: these support a real legal review, but do not substitute for one.
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

/** e.g. "the State of California, United States". Drives the governing-law clause. */
export const GOVERNING_LAW =
  process.env.NEXT_PUBLIC_GOVERNING_LAW?.trim() || null;
