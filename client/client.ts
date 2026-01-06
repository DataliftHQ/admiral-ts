import type { Transport, Client as ConnectClient } from "@connectrpc/connect";
import { createClient as createConnectClient } from "@connectrpc/connect";
import type { ClientConfig } from "./lib/config.js";
import { createTransport } from "./lib/transport.js";
import { validateAuthToken, getTokenInfo, type JWTClaims } from "./lib/auth.js";
import { HealthcheckAPI } from "../proto/healthcheck/v1/healthcheck_pb.js";
import { UserAPI } from "../proto/user/v1/user_pb.js";

// Service client types
type HealthcheckClient = ConnectClient<typeof HealthcheckAPI>;
type UserClient = ConnectClient<typeof UserAPI>;

/**
 * Admiral client interface.
 */
export interface Client {
  /** The underlying Connect transport */
  readonly transport: Transport;

  /** Healthcheck service client */
  readonly healthcheck: HealthcheckClient;

  /** User service client */
  readonly user: UserClient;

  /**
   * Validates the current auth token.
   * @returns Token validation result
   */
  validateToken(): { valid: boolean; error?: string; claims?: JWTClaims };

  /**
   * Gets information about the current auth token.
   * @returns Token claims and expiration info
   */
  getTokenInfo(): { claims: JWTClaims; isExpired: boolean; expiresIn: number } | null;
}

/**
 * Creates a new Admiral API client.
 *
 * @param config - Client configuration
 * @returns Client instance with service accessors
 *
 * @example
 * ```typescript
 * import { createClient } from "@admiral-io/sdk";
 *
 * const client = createClient({
 *   baseUrl: "https://api.admiral.io",
 *   authToken: "your-token-here",
 * });
 *
 * // Access services via properties
 * const resp = await client.healthcheck.healthcheckMethod({});
 * ```
 */
export function createClient(config: ClientConfig): Client {
  const transport = createTransport(config);

  // Lazily initialized service clients
  let _healthcheck: HealthcheckClient | undefined;
  let _user: UserClient | undefined;

  return {
    transport,

    get healthcheck() {
      if (!_healthcheck) {
        _healthcheck = createConnectClient(HealthcheckAPI, transport);
      }
      return _healthcheck;
    },

    get user() {
      if (!_user) {
        _user = createConnectClient(UserAPI, transport);
      }
      return _user;
    },

    validateToken() {
      if (!config.authToken) {
        return { valid: false, error: "No auth token configured" };
      }
      return validateAuthToken(config.authToken);
    },

    getTokenInfo() {
      if (!config.authToken) {
        return null;
      }
      try {
        return getTokenInfo(config.authToken);
      } catch {
        return null;
      }
    },
  };
}
