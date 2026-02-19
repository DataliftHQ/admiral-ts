import type { Transport, Client as ConnectClient } from "@connectrpc/connect";
import { createClient as createConnectClient } from "@connectrpc/connect";
import type { ClientConfig } from "./lib/config.js";
import { resolveConfig } from "./lib/config.js";
import { createTransport } from "./lib/transport.js";
import { validateAuthToken, getTokenInfo, type JWTClaims } from "./lib/auth.js";
import { ApplicationAPI } from "../proto/application/v1/application_pb.js";
import { ClusterAPI } from "../proto/cluster/v1/cluster_pb.js";
import { EnvironmentAPI } from "../proto/environment/v1/environment_pb.js";
import { HealthcheckAPI } from "../proto/healthcheck/v1/healthcheck_pb.js";
import { UserAPI } from "../proto/user/v1/user_pb.js";
import { VariableAPI } from "../proto/variable/v1/variable_pb.js";

// Service client types
type ApplicationClient = ConnectClient<typeof ApplicationAPI>;
type ClusterClient = ConnectClient<typeof ClusterAPI>;
type EnvironmentClient = ConnectClient<typeof EnvironmentAPI>;
type HealthcheckClient = ConnectClient<typeof HealthcheckAPI>;
type UserClient = ConnectClient<typeof UserAPI>;
type VariableClient = ConnectClient<typeof VariableAPI>;

/**
 * Admiral client interface.
 */
export interface Client {
  /** The underlying Connect transport */
  readonly transport: Transport;

  /** Application service client */
  readonly application: ApplicationClient;

  /** Cluster service client */
  readonly cluster: ClusterClient;

  /** Environment service client */
  readonly environment: EnvironmentClient;

  /** Healthcheck service client */
  readonly healthcheck: HealthcheckClient;

  /** User service client */
  readonly user: UserClient;

  /** Variable service client */
  readonly variable: VariableClient;

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
 * const resp = await client.application.applicationMethod({});
 * ```
 */
export function createClient(config: ClientConfig): Client {
  const resolved = resolveConfig(config);
  const transport = createTransport(config);

  resolved.logger.debug("connected to Admiral API", resolved.baseUrl);

  // Lazily initialized service clients
  let _application: ApplicationClient | undefined;
  let _cluster: ClusterClient | undefined;
  let _environment: EnvironmentClient | undefined;
  let _healthcheck: HealthcheckClient | undefined;
  let _user: UserClient | undefined;
  let _variable: VariableClient | undefined;

  return {
    transport,

    get application() {
      if (!_application) {
        _application = createConnectClient(ApplicationAPI, transport);
      }
      return _application;
    },

    get cluster() {
      if (!_cluster) {
        _cluster = createConnectClient(ClusterAPI, transport);
      }
      return _cluster;
    },

    get environment() {
      if (!_environment) {
        _environment = createConnectClient(EnvironmentAPI, transport);
      }
      return _environment;
    },

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

    get variable() {
      if (!_variable) {
        _variable = createConnectClient(VariableAPI, transport);
      }
      return _variable;
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
