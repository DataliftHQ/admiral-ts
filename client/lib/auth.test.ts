import { describe, it, expect } from "vitest";
import {
  parseJWTToken,
  validateAuthToken,
  isTokenExpired,
  tokenExpiresIn,
  type JWTClaims,
} from "./auth.js";

// Helper to create a valid JWT structure (header.payload.signature)
function createTestJWT(claims: Partial<JWTClaims>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(claims));
  const signature = "test-signature";
  return `${header}.${payload}.${signature}`;
}

describe("parseJWTToken", () => {
  it("parses valid JWT token", () => {
    const token = createTestJWT({
      sub: "user-123",
      iss: "admiral",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const claims = parseJWTToken(token);
    expect(claims.sub).toBe("user-123");
    expect(claims.iss).toBe("admiral");
  });

  it("throws on invalid token format", () => {
    expect(() => parseJWTToken("invalid")).toThrow();
    expect(() => parseJWTToken("only.two")).toThrow();
    expect(() => parseJWTToken("")).toThrow();
  });

  it("throws on invalid base64 payload", () => {
    expect(() => parseJWTToken("valid.!!!invalid!!!.signature")).toThrow();
  });

  it("throws on invalid JSON payload", () => {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa("not-json");
    expect(() => parseJWTToken(`${header}.${payload}.sig`)).toThrow();
  });
});

describe("validateAuthToken", () => {
  it("returns valid for non-expired token", () => {
    const token = createTestJWT({
      sub: "user-123",
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    });

    const result = validateAuthToken(token);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns invalid for expired token", () => {
    const token = createTestJWT({
      sub: "user-123",
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });

    const result = validateAuthToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("returns invalid for empty token", () => {
    const result = validateAuthToken("");
    expect(result.valid).toBe(false);
  });

  it("accepts opaque tokens", () => {
    const result = validateAuthToken("opaque-token-without-dots-12345");
    expect(result.valid).toBe(true);
  });

  it("returns invalid for short opaque tokens", () => {
    const result = validateAuthToken("short");
    expect(result.valid).toBe(false);
  });
});

describe("isTokenExpired", () => {
  it("returns true for expired token", () => {
    const claims: JWTClaims = {
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    expect(isTokenExpired(claims)).toBe(true);
  });

  it("returns false for non-expired token", () => {
    const claims: JWTClaims = {
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    expect(isTokenExpired(claims)).toBe(false);
  });

  it("returns false for token without expiration", () => {
    const claims: JWTClaims = {};
    expect(isTokenExpired(claims)).toBe(false);
  });
});

describe("tokenExpiresIn", () => {
  it("returns positive value for non-expired token", () => {
    const claims: JWTClaims = {
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const expiresIn = tokenExpiresIn(claims);
    expect(expiresIn).toBeGreaterThan(3500000); // ~3600 seconds in ms
    expect(expiresIn).toBeLessThanOrEqual(3600000);
  });

  it("returns negative value for expired token", () => {
    const claims: JWTClaims = {
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    const expiresIn = tokenExpiresIn(claims);
    expect(expiresIn).toBeLessThan(0);
  });

  it("returns 0 for token without expiration", () => {
    const claims: JWTClaims = {};
    expect(tokenExpiresIn(claims)).toBe(0);
  });
});
