/**
 * Analytics transport boundary.
 *
 * Stage 1 ships `NoopAnalyticsClient` only — no PostHog SDK, no network send.
 * Stage 2 / product apps may add `PostHogAnalyticsClient` behind the same interface
 * and switch after consent (`granted`). Failures must never break local saves or UI.
 */

export type AnalyticsConsent = "granted" | "denied";

/**
 * Boilerplate keeps events open. Product apps should narrow this to a
 * discriminated union of allowed events (no free-form screen capture).
 */
export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
};

export interface AnalyticsClient {
  setConsent(consent: AnalyticsConsent): Promise<void>;
  capture(event: AnalyticsEvent): void;
  reset(): Promise<void>;
  flush?(): Promise<void>;
}

/** No-op client: consent and capture are ignored; nothing is sent. */
export class NoopAnalyticsClient implements AnalyticsClient {
  async setConsent(_consent: AnalyticsConsent): Promise<void> {}

  capture(_event: AnalyticsEvent): void {}

  async reset(): Promise<void> {}

  async flush(): Promise<void> {}
}

/** Shared singleton. Replace only by assigning a different `AnalyticsClient`. */
export const analyticsClient: AnalyticsClient = new NoopAnalyticsClient();
