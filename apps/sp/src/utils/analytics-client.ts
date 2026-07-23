/**
 * Analytics transport boundary.
 *
 * Stage 2 ships `NoopAnalyticsClient` and `PostHogAnalyticsClient`.
 * Consent OFF / unset → no send. Consent ON → manual `capture` only.
 * No Session Replay, lifecycle autocapture, feature flags, or `identify`.
 * Failures must never break local saves or UI.
 *
 * `posthog-react-native` is loaded only inside the default transport factory
 * so unit tests of consent / capture gating do not pull React Native into Bun.
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

/** Project API Key placeholder only — never put Personal / admin keys here. */
export const POSTHOG_API_KEY_PLACEHOLDER = "phc_REPLACE_WITH_PROJECT_API_KEY";

/** Default cloud host placeholder (US). Product may switch to EU or a proxy. */
export const POSTHOG_HOST_PLACEHOLDER = "https://us.i.posthog.com";

export type PostHogPublicConfig = {
  apiKey: string;
  host: string;
};

/**
 * Resolve Project API Key / host from Expo public env, falling back to
 * placeholders. Products replace env or these constants after copy-fork.
 */
export function resolvePostHogConfig(
  env: NodeJS.ProcessEnv = process.env,
): PostHogPublicConfig {
  const apiKey = env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
  const host = env.EXPO_PUBLIC_POSTHOG_HOST?.trim();
  return {
    apiKey: apiKey && apiKey.length > 0 ? apiKey : POSTHOG_API_KEY_PLACEHOLDER,
    host: host && host.length > 0 ? host : POSTHOG_HOST_PLACEHOLDER,
  };
}

/** Minimal PostHog surface used by `PostHogAnalyticsClient` (injectable in tests). */
export type PostHogTransport = {
  capture: (
    event: string,
    properties?: Record<string, string | number | boolean | null>,
  ) => void;
  optIn: () => void | Promise<void>;
  optOut: () => void | Promise<void>;
  reset: () => void | Promise<void>;
  flush?: () => void | Promise<void>;
};

export type PostHogAnalyticsClientOptions = {
  /** Injected transport (unit tests). Skips SDK load. */
  transport?: PostHogTransport;
  /** Lazy factory for the real SDK (or a custom transport). */
  createTransport?: () => PostHogTransport;
  /** Optional config override when using the default SDK factory. */
  config?: PostHogPublicConfig;
};

/** No-op client: consent and capture are ignored; nothing is sent. */
export class NoopAnalyticsClient implements AnalyticsClient {
  async setConsent(_consent: AnalyticsConsent): Promise<void> {}

  capture(_event: AnalyticsEvent): void {}

  async reset(): Promise<void> {}

  async flush(): Promise<void> {}
}

/**
 * PostHog transport with consent gating.
 * Unset / denied → capture is a no-op and the SDK stays opted out.
 * Granted → `optIn` then manual `capture` only (no autocapture wiring).
 */
export class PostHogAnalyticsClient implements AnalyticsClient {
  private consent: AnalyticsConsent | null = null;
  private transport: PostHogTransport | null;
  private readonly createTransport: () => PostHogTransport;

  constructor(options: PostHogAnalyticsClientOptions = {}) {
    if (options.transport) {
      this.transport = options.transport;
      this.createTransport = () => options.transport as PostHogTransport;
      return;
    }
    this.transport = null;
    const config = options.config;
    this.createTransport =
      options.createTransport ?? (() => createDefaultPostHogTransport(config));
  }

  /** Current consent; `null` means unset (treated as denied for send). */
  getConsent(): AnalyticsConsent | null {
    return this.consent;
  }

  async setConsent(consent: AnalyticsConsent): Promise<void> {
    const previous = this.consent;
    this.consent = consent;
    try {
      if (consent === "granted") {
        await this.getTransport().optIn();
        return;
      }
      // denied: only talk to SDK if it was created or previously granted
      if (this.transport != null || previous === "granted") {
        await this.getTransport().optOut();
      }
    } catch {
      // Analytics must not break local saves or UI.
    }
  }

  capture(event: AnalyticsEvent): void {
    if (this.consent !== "granted") {
      return;
    }
    try {
      this.getTransport().capture(event.name, event.properties);
    } catch {
      // Analytics must not break local saves or UI.
    }
  }

  async reset(): Promise<void> {
    this.consent = null;
    if (this.transport == null) {
      return;
    }
    try {
      await this.transport.reset();
      await this.transport.optOut();
    } catch {
      // Analytics must not break local saves or UI.
    }
  }

  async flush(): Promise<void> {
    if (this.transport?.flush == null) {
      return;
    }
    try {
      await this.transport.flush();
    } catch {
      // Analytics must not break local saves or UI.
    }
  }

  private getTransport(): PostHogTransport {
    if (this.transport == null) {
      this.transport = this.createTransport();
    }
    return this.transport;
  }
}

/**
 * Default PostHog SDK options for this boilerplate:
 * opted out until consent, no lifecycle / replay / flag traffic.
 */
export function createPostHogSdkOptions(host: string) {
  return {
    host,
    defaultOptIn: false,
    captureAppLifecycleEvents: false,
    enableSessionReplay: false,
    preloadFeatureFlags: false,
    sendFeatureFlagEvent: false,
    disableRemoteFeatureFlags: true,
  } as const;
}

function createDefaultPostHogTransport(
  configOverride?: PostHogPublicConfig,
): PostHogTransport {
  // Lazy require keeps Bun unit tests free of React Native.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PostHog = require("posthog-react-native").default as new (
    apiKey: string,
    options?: ReturnType<typeof createPostHogSdkOptions>,
  ) => PostHogTransport;
  const { apiKey, host } = configOverride ?? resolvePostHogConfig();
  return new PostHog(apiKey, createPostHogSdkOptions(host));
}

/**
 * Shared singleton. Starts as PostHog transport with consent unset (send 0).
 * Replace only by assigning a different `AnalyticsClient` in product apps
 * that need a custom wiring (e.g. keep Noop in tests).
 */
export let analyticsClient: AnalyticsClient = new PostHogAnalyticsClient();

/** Swap the shared singleton (tests / product bootstrap). */
export function setAnalyticsClient(client: AnalyticsClient): void {
  analyticsClient = client;
}
