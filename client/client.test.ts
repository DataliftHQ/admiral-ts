import { describe, it, expect } from "vitest";
import { createClient } from "./client.js";

// Helper to create a valid JWT
function createTestJWT(claims: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(claims));
  const signature = "test-signature";
  return `${header}.${payload}.${signature}`;
}

describe("createClient", () => {
  it("creates a client with transport", () => {
    const client = createClient({
      authToken: createTestJWT({
        sub: "user-123",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    });

    expect(client).toBeDefined();
    expect(client.transport).toBeDefined();
  });

  it("exposes validateToken method", () => {
    const token = createTestJWT({
      sub: "user-123",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const client = createClient({ authToken: token });
    const result = client.validateToken();

    expect(result.valid).toBe(true);
  });

  it("validateToken returns invalid for expired token", () => {
    const token = createTestJWT({
      sub: "user-123",
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired
    });

    const client = createClient({ authToken: token });
    const result = client.validateToken();

    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("validateToken returns invalid when no token configured", () => {
    const client = createClient({ authToken: "" });
    const result = client.validateToken();

    expect(result.valid).toBe(false);
    expect(result.error).toContain("No auth token");
  });

  it("exposes getTokenInfo method", () => {
    const token = createTestJWT({
      sub: "user-123",
      iss: "admiral",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const client = createClient({ authToken: token });
    const info = client.getTokenInfo();

    expect(info).not.toBeNull();
    expect(info?.claims.sub).toBe("user-123");
    expect(info?.claims.iss).toBe("admiral");
    expect(info?.isExpired).toBe(false);
    expect(info?.expiresIn).toBeGreaterThan(0);
  });

  it("getTokenInfo returns null when no token configured", () => {
    const client = createClient({ authToken: "" });
    const info = client.getTokenInfo();

    expect(info).toBeNull();
  });

  it("getTokenInfo returns null for invalid token", () => {
    const client = createClient({ authToken: "invalid-token" });
    const info = client.getTokenInfo();

    expect(info).toBeNull();
  });
});
