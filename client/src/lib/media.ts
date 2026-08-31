/**
 * Media URL normalisation.
 *
 * Uploaded media is stored with an absolute URL whose host is whatever the
 * uploading device used to reach the API — in dev that is a laptop's LAN IP,
 * which is frozen into the row forever. The database currently holds seven
 * different hosts this way. The mobile app never notices because its own
 * `utils/fileUrl.js` re-hosts on read; this is the console's equivalent.
 *
 * The `/files/` trick is the important part: finding that segment anywhere in
 * the string and keeping only the suffix discards whatever stale host preceded
 * it, so a legacy row works regardless of which IP it carries.
 */

/** Empty in dev so paths stay same-origin and hit the Vite proxy. */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Our own file route, UUID required.
 *
 * Matching a bare "/files/" is NOT safe — Shopify serves product images from
 * `.../cdn/shop/files/<name>.jpg`, so a loose match rewrites a working external
 * CDN URL into a dead path on our host.
 */
const OUR_FILE = /\/files\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export const mediaUrl = (raw: string | null | undefined): string | null => {
  if (!raw) return null;

  const ours = OUR_FILE.exec(raw);
  if (ours) return `${API_BASE}${raw.slice(ours.index)}`;

  // A genuine external asset (a brand's own CDN) — leave it alone.
  if (/^https?:\/\//i.test(raw)) return raw;

  // Anything device-local can never resolve in a browser.
  if (/^(file|content|data):/i.test(raw)) return null;

  return `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

/** `mediaUrl` with a placeholder, for `<img src>` that must always resolve. */
export const mediaUrlOr = (raw: string | null | undefined, fallback: string): string =>
  mediaUrl(raw) ?? fallback;

/** Swaps a broken image for the placeholder instead of a broken-image icon. */
export const onImageError =
  (fallback: string) =>
  (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.dataset.fellBack === "true") return; // the fallback itself failed
    el.dataset.fellBack = "true";
    el.src = fallback;
  };

export const POST_IMAGE_FALLBACK = "/product_dress_1.png";
