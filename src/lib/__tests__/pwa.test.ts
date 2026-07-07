import { describe, expect, it } from "vitest";
import {
  getServiceWorkerRegistrationOptions,
  isLocalHost,
  shouldRegisterServiceWorker,
} from "@/lib/utils/pwa";

describe("pwa utilities", () => {
  it("allows service worker registration on secure origins", () => {
    expect(
      shouldRegisterServiceWorker({
        hasServiceWorker: true,
        hostname: "trackpaisa.app",
        nodeEnv: "production",
        protocol: "https:",
      }),
    ).toBe(true);
  });

  it("allows service worker registration on localhost during development", () => {
    expect(isLocalHost("localhost")).toBe(true);
    expect(
      shouldRegisterServiceWorker({
        hasServiceWorker: true,
        hostname: "localhost",
        nodeEnv: "development",
        protocol: "http:",
      }),
    ).toBe(true);
  });

  it("blocks unsupported or test registrations", () => {
    expect(
      shouldRegisterServiceWorker({
        hasServiceWorker: false,
        hostname: "trackpaisa.app",
        nodeEnv: "production",
        protocol: "https:",
      }),
    ).toBe(false);

    expect(
      shouldRegisterServiceWorker({
        hasServiceWorker: true,
        hostname: "trackpaisa.app",
        nodeEnv: "test",
        protocol: "https:",
      }),
    ).toBe(false);
  });

  it("uses the app root as the service worker scope", () => {
    expect(getServiceWorkerRegistrationOptions()).toEqual({ scope: "/" });
  });
});
