import type { Transport, Client as ConnectClient } from "@connectrpc/connect";
import { createClient as createConnectClient } from "@connectrpc/connect";
import type { ClientConfig } from "./lib/config.js";
import { createTransport } from "./lib/transport.js";
import { validateAuthToken, getTokenInfo, type JWTClaims } from "./lib/auth.js";
import { AgentAPI } from "../proto/agent/v1/agent_pb.js";
import { ClusterAPI } from "../proto/cluster/v1/cluster_pb.js";
import { HealthcheckAPI } from "../proto/healthcheck/v1/healthcheck_pb.js";
import { RunnerAPI } from "../proto/runner/v1/runner_pb.js";
import { ServiceAccountAPI } from "../proto/serviceaccount/v1/serviceaccount_pb.js";
import { UserAPI } from "../proto/user/v1/user_pb.js";

// Service client types
type AgentClient = ConnectClient<typeof AgentAPI>;
type ClusterClient = ConnectClient<typeof ClusterAPI>;
type HealthcheckClient = ConnectClient<typeof HealthcheckAPI>;
type RunnerClient = ConnectClient<typeof RunnerAPI>;
type ServiceAccountClient = ConnectClient<typeof ServiceAccountAPI>;
type UserClient = ConnectClient<typeof UserAPI>;

/**
 * Admiral client interface.
 */
export interface Client {
  /** The underlying Connect transport */
  readonly transport: Transport;

  /** Agent service client */
  readonly agent: AgentClient;

  /** Cluster service client */
  readonly cluster: ClusterClient;

  /** Healthcheck service client */
  readonly healthcheck: HealthcheckClient;

  /** Runner service client */
  readonly runner: RunnerClient;

  /** ServiceAccount service client */
  readonly serviceAccount: ServiceAccountClient;

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
 * const resp = await client.agent.agentMethod({});
 * ```
 */
export function createClient(config: ClientConfig): Client {
  const transport = createTransport(config);

  // Lazily initialized service clients
  let _agent: AgentClient | undefined;
  let _cluster: ClusterClient | undefined;
  let _healthcheck: HealthcheckClient | undefined;
  let _runner: RunnerClient | undefined;
  let _serviceAccount: ServiceAccountClient | undefined;
  let _user: UserClient | undefined;

  return {
    transport,

    get agent() {
      if (!_agent) {
        _agent = createConnectClient(AgentAPI, transport);
      }
      return _agent;
    },

    get cluster() {
      if (!_cluster) {
        _cluster = createConnectClient(ClusterAPI, transport);
      }
      return _cluster;
    },

    get healthcheck() {
      if (!_healthcheck) {
        _healthcheck = createConnectClient(HealthcheckAPI, transport);
      }
      return _healthcheck;
    },

    get runner() {
      if (!_runner) {
        _runner = createConnectClient(RunnerAPI, transport);
      }
      return _runner;
    },

    get serviceAccount() {
      if (!_serviceAccount) {
        _serviceAccount = createConnectClient(ServiceAccountAPI, transport);
      }
      return _serviceAccount;
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
