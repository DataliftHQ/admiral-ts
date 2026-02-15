import { describe, it, expect } from "vitest";
import { resolveConfig, DEFAULT_CONFIG, type ClientConfig } from "./config.js";

describe("resolveConfig", () => {
  it("uses default baseUrl when not provided", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.baseUrl).toBe(DEFAULT_CONFIG.baseUrl);
  });

  it("uses provided baseUrl", () => {
    const config: ClientConfig = {
      authToken: "test-token",
      baseUrl: "https://custom.api.io",
    };

    const resolved = resolveConfig(config);
    expect(resolved.baseUrl).toBe("https://custom.api.io");
  });

  it("uses default timeout when not provided", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.timeout).toBe(DEFAULT_CONFIG.timeout);
  });

  it("uses provided timeout", () => {
    const config: ClientConfig = {
      authToken: "test-token",
      timeout: 60000,
    };

    const resolved = resolveConfig(config);
    expect(resolved.timeout).toBe(60000);
  });

  it("uses default httpVersion when not provided", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.httpVersion).toBe(DEFAULT_CONFIG.httpVersion);
  });

  it("preserves authToken", () => {
    const config: ClientConfig = {
      authToken: "my-secret-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.authToken).toBe("my-secret-token");
  });

  it("preserves custom headers", () => {
    const config: ClientConfig = {
      authToken: "test-token",
      headers: {
        "X-Custom-Header": "custom-value",
        "X-Another": "another-value",
      },
    };

    const resolved = resolveConfig(config);
    expect(resolved.headers).toEqual({
      "X-Custom-Header": "custom-value",
      "X-Another": "another-value",
    });
  });

  it("handles undefined headers", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.headers).toBeUndefined();
  });
});

  it("defaults authScheme to bearer", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.authScheme).toBe("bearer");
  });

  it("preserves provided authScheme", () => {
    const config: ClientConfig = {
      authToken: "test-token",
      authScheme: "token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.authScheme).toBe("token");
  });

  it("defaults logger to noopLogger", () => {
    const config: ClientConfig = {
      authToken: "test-token",
    };

    const resolved = resolveConfig(config);
    expect(resolved.logger).toBeDefined();
    // Should not throw
    resolved.logger.debug("test");
    resolved.logger.info("test");
    resolved.logger.warn("test");
    resolved.logger.error("test");
  });
});

describe("DEFAULT_CONFIG", () => {
  it("has expected default values", () => {
    expect(DEFAULT_CONFIG.baseUrl).toBe("https://api.admiral.io");
    expect(DEFAULT_CONFIG.timeout).toBe(30000);
    expect(DEFAULT_CONFIG.httpVersion).toBe("2");
  });
});
