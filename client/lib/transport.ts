import { createConnectTransport } from "@connectrpc/connect-node";
import type { Interceptor, Transport } from "@connectrpc/connect";
import type { ClientConfig, AuthScheme } from "./config.js";
import { resolveConfig } from "./config.js";

/**
 * Creates an authentication interceptor that adds the Authorization header.
 */
function createAuthInterceptor(authToken: string, scheme: AuthScheme): Interceptor {
  const prefix = scheme === "token" ? "Token" : "Bearer";
  return (next) => async (req) => {
    req.header.set("Authorization", `${prefix} ${authToken}`);
    return next(req);
  };
}

/**
 * Creates a headers interceptor for custom headers.
 */
function createHeadersInterceptor(headers: Record<string, string>): Interceptor {
  return (next) => async (req) => {
    for (const [key, value] of Object.entries(headers)) {
      req.header.set(key, value);
    }
    return next(req);
  };
}

/**
 * Creates a timeout interceptor.
 */
function createTimeoutInterceptor(timeoutMs: number): Interceptor {
  return (next) => async (req) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // If there's an existing signal, combine them
    if (req.signal) {
      req.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      return await next({ ...req, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Creates a Connect transport with the provided configuration.
 */
export function createTransport(config: ClientConfig): Transport {
  const resolved = resolveConfig(config);
  const interceptors: Interceptor[] = [];

  // Add timeout interceptor
  interceptors.push(createTimeoutInterceptor(resolved.timeout));

  // Add custom headers interceptor
  if (resolved.headers && Object.keys(resolved.headers).length > 0) {
    interceptors.push(createHeadersInterceptor(resolved.headers));
  }

  // Add auth interceptor if token provided
  // Note: Token validation is lazy - use client.validateToken() to check
  if (resolved.authToken) {
    interceptors.push(createAuthInterceptor(resolved.authToken, resolved.authScheme));
  }

  return createConnectTransport({
    baseUrl: resolved.baseUrl,
    httpVersion: resolved.httpVersion,
    interceptors,
  });
}
