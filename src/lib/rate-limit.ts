/**
 * In-memory sliding-window rate limiter.
 *
 * Works per-instance. In a serverless environment (Vercel) this is best-effort:
 * each cold-start has a fresh counter, so it protects against bursts within a
 * single warm instance but not across instances. For strict multi-instance rate
 * limiting, replace the Map with Upstash Redis (@upstash/ratelimit).
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

// Prune entries older than 5 minutes every 500 requests to avoid unbounded growth
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 500) return;
  pruneCounter = 0;
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [key, win] of store.entries()) {
    if (win.timestamps.length === 0 || win.timestamps[win.timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

/**
 * Returns true if the request should be allowed, false if rate-limited.
 *
 * @param key      Unique key (e.g. IP address or "ip:route")
 * @param limit    Max requests allowed within the window
 * @param windowMs Window size in milliseconds (default: 60_000 = 1 min)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  maybePrune();
  const now = Date.now();
  const cutoff = now - windowMs;

  let win = store.get(key);
  if (!win) {
    win = { timestamps: [] };
    store.set(key, win);
  }

  // Slide the window
  win.timestamps = win.timestamps.filter((t) => t > cutoff);

  if (win.timestamps.length >= limit) return false;

  win.timestamps.push(now);
  return true;
}
