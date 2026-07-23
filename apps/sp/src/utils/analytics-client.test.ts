import { describe, expect, mock, test } from "bun:test";
import {
  createPostHogSdkOptions,
  NoopAnalyticsClient,
  POSTHOG_API_KEY_PLACEHOLDER,
  POSTHOG_HOST_PLACEHOLDER,
  PostHogAnalyticsClient,
  type PostHogTransport,
  resolvePostHogConfig,
} from "./analytics-client";

function createMockTransport(): PostHogTransport & {
  calls: {
    capture: Array<{ name: string; properties?: AnalyticsProps }>;
    optIn: number;
    optOut: number;
    reset: number;
    flush: number;
  };
} {
  type AnalyticsProps = Record<string, string | number | boolean | null>;
  const calls = {
    capture: [] as Array<{ name: string; properties?: AnalyticsProps }>,
    optIn: 0,
    optOut: 0,
    reset: 0,
    flush: 0,
  };
  return {
    calls,
    capture(name, properties) {
      calls.capture.push({ name, properties });
    },
    async optIn() {
      calls.optIn += 1;
    },
    async optOut() {
      calls.optOut += 1;
    },
    async reset() {
      calls.reset += 1;
    },
    async flush() {
      calls.flush += 1;
    },
  };
}

describe("resolvePostHogConfig", () => {
  test("falls back to placeholders", () => {
    expect(resolvePostHogConfig({})).toEqual({
      apiKey: POSTHOG_API_KEY_PLACEHOLDER,
      host: POSTHOG_HOST_PLACEHOLDER,
    });
  });

  test("reads Expo public env when set", () => {
    expect(
      resolvePostHogConfig({
        EXPO_PUBLIC_POSTHOG_API_KEY: " phc_test ",
        EXPO_PUBLIC_POSTHOG_HOST: " https://eu.i.posthog.com ",
      }),
    ).toEqual({
      apiKey: "phc_test",
      host: "https://eu.i.posthog.com",
    });
  });
});

describe("createPostHogSdkOptions", () => {
  test("disables autocapture-style features", () => {
    expect(createPostHogSdkOptions("https://us.i.posthog.com")).toEqual({
      host: "https://us.i.posthog.com",
      defaultOptIn: false,
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
      preloadFeatureFlags: false,
      sendFeatureFlagEvent: false,
      disableRemoteFeatureFlags: true,
    });
  });
});

describe("NoopAnalyticsClient", () => {
  test("never throws and never sends", async () => {
    const client = new NoopAnalyticsClient();
    await client.setConsent("granted");
    client.capture({ name: "x" });
    await client.reset();
    await client.flush();
  });
});

describe("PostHogAnalyticsClient", () => {
  test("unset consent sends nothing and does not create transport", () => {
    const createTransport = mock(() => createMockTransport());
    const client = new PostHogAnalyticsClient({ createTransport });
    client.capture({ name: "before_consent", properties: { a: 1 } });
    expect(createTransport).not.toHaveBeenCalled();
  });

  test("denied consent sends nothing without creating transport", async () => {
    const createTransport = mock(() => createMockTransport());
    const client = new PostHogAnalyticsClient({ createTransport });
    await client.setConsent("denied");
    client.capture({ name: "denied_event" });
    expect(createTransport).not.toHaveBeenCalled();
    expect(client.getConsent()).toBe("denied");
  });

  test("granted consent opts in and captures manually", async () => {
    const transport = createMockTransport();
    const client = new PostHogAnalyticsClient({ transport });
    await client.setConsent("granted");
    client.capture({
      name: "manual_event",
      properties: { count: 2, ok: true },
    });
    expect(transport.calls.optIn).toBe(1);
    expect(transport.calls.capture).toEqual([
      { name: "manual_event", properties: { count: 2, ok: true } },
    ]);
  });

  test("revoking consent opts out and stops capture", async () => {
    const transport = createMockTransport();
    const client = new PostHogAnalyticsClient({ transport });
    await client.setConsent("granted");
    await client.setConsent("denied");
    client.capture({ name: "after_revoke" });
    expect(transport.calls.optOut).toBe(1);
    expect(transport.calls.capture).toEqual([]);
  });

  test("reset clears consent and opts out without identify", async () => {
    const transport = createMockTransport();
    const client = new PostHogAnalyticsClient({ transport });
    await client.setConsent("granted");
    client.capture({ name: "once" });
    await client.reset();
    client.capture({ name: "after_reset" });
    expect(client.getConsent()).toBeNull();
    expect(transport.calls.reset).toBe(1);
    expect(transport.calls.optOut).toBe(1);
    expect(transport.calls.capture).toEqual([
      { name: "once", properties: undefined },
    ]);
  });

  test("transport errors are swallowed", async () => {
    const client = new PostHogAnalyticsClient({
      transport: {
        capture() {
          throw new Error("capture failed");
        },
        async optIn() {
          throw new Error("optIn failed");
        },
        async optOut() {
          throw new Error("optOut failed");
        },
        async reset() {
          throw new Error("reset failed");
        },
        async flush() {
          throw new Error("flush failed");
        },
      },
    });
    await client.setConsent("granted");
    client.capture({ name: "x" });
    await client.flush();
    await client.reset();
  });
});
