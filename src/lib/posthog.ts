import { PostHog } from 'posthog-node';

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
      flushAt: 20,
      flushInterval: 10_000,
    });
  }
  return _client;
}
