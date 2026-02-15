import type { Logger } from "./logger.js";
import { noopLogger } from "./logger.js";

/** Authorization header scheme. */
export type AuthScheme = "bearer" | "token";

/**
 * Client configuration options.
 */
export interface ClientConfig {
  /**
   * Base URL for the API server.
   * @default "https://api.admiral.io"
   * @example "https://api.admiral.io"
   */
  baseUrl?: string;

  /**
   * Authentication token (JWT or opaque token).
   */
  authToken?: string;

  /**
   * Authorization header scheme.
   * - `"bearer"` → `Authorization: Bearer <token>` (default)
   * - `"token"` → `Authorization: Token <token>`
   * @default "bearer"
   */
  authScheme?: AuthScheme;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * HTTP version to use.
   * @default "2"
   */
  httpVersion?: "1.1" | "2";

  /**
   * Custom headers to include in all requests.
   */
  headers?: Record<string, string>;

  /**
   * Logger instance. Silent by default (noopLogger).
   * Use `createConsoleLogger("debug")` to enable output.
   */
  logger?: Logger;
}

/**
 * Default configuration values.
 */
export const DEFAULT_CONFIG = {
  baseUrl: "https://api.admiral.io",
  timeout: 30000,
  httpVersion: "2" as const,
  authScheme: "bearer" as AuthScheme,
} as const;

/**
 * Validates and applies defaults to the configuration.
 */
export function resolveConfig(config: ClientConfig): Required<Omit<ClientConfig, "authToken" | "headers">> & Pick<ClientConfig, "authToken" | "headers"> {
  const baseUrl = config.baseUrl ?? DEFAULT_CONFIG.baseUrl;

  // Validate URL format
  try {
    new URL(baseUrl);
  } catch {
    throw new Error(`Invalid baseUrl: ${baseUrl}`);
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
    authToken: config.authToken,
    authScheme: config.authScheme ?? DEFAULT_CONFIG.authScheme,
    timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    httpVersion: config.httpVersion ?? DEFAULT_CONFIG.httpVersion,
    headers: config.headers,
    logger: config.logger ?? noopLogger,
  };
}
