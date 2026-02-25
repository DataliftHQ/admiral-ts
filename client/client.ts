import type { Transport, Client as ConnectClient } from "@connectrpc/connect";
import { createClient as createConnectClient } from "@connectrpc/connect";
import type { ClientConfig } from "./lib/config.js";
import { resolveConfig } from "./lib/config.js";
import { createTransport } from "./lib/transport.js";
import { validateAuthToken, getTokenInfo, type JWTClaims } from "./lib/auth.js";
import { ApplicationAPI } from "../proto/admiral/api/application/v1/application_pb.js";
import { ClusterAPI } from "../proto/admiral/api/cluster/v1/cluster_pb.js";
import { ComponentAPI } from "../proto/admiral/api/component/v1/component_pb.js";
import { ConnectionAPI } from "../proto/admiral/api/connection/v1/connection_pb.js";
import { DeploymentAPI } from "../proto/admiral/api/deployment/v1/deployment_pb.js";
import { EnvironmentAPI } from "../proto/admiral/api/environment/v1/environment_pb.js";
import { HealthcheckAPI } from "../proto/admiral/api/healthcheck/v1/healthcheck_pb.js";
import { RunnerAPI } from "../proto/admiral/api/runner/v1/runner_pb.js";
import { SourceAPI } from "../proto/admiral/api/source/v1/source_pb.js";
import { StateAPI } from "../proto/admiral/api/state/v1/state_pb.js";
import { UserAPI } from "../proto/admiral/api/user/v1/user_pb.js";
import { VariableAPI } from "../proto/admiral/api/variable/v1/variable_pb.js";

// Service client types
type ApplicationClient = ConnectClient<typeof ApplicationAPI>;
type ClusterClient = ConnectClient<typeof ClusterAPI>;
type ComponentClient = ConnectClient<typeof ComponentAPI>;
type ConnectionClient = ConnectClient<typeof ConnectionAPI>;
type DeploymentClient = ConnectClient<typeof DeploymentAPI>;
type EnvironmentClient = ConnectClient<typeof EnvironmentAPI>;
type HealthcheckClient = ConnectClient<typeof HealthcheckAPI>;
type RunnerClient = ConnectClient<typeof RunnerAPI>;
type SourceClient = ConnectClient<typeof SourceAPI>;
type StateClient = ConnectClient<typeof StateAPI>;
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

  /** Component service client */
  readonly component: ComponentClient;

  /** Connection service client */
  readonly connection: ConnectionClient;

  /** Deployment service client */
  readonly deployment: DeploymentClient;

  /** Environment service client */
  readonly environment: EnvironmentClient;

  /** Healthcheck service client */
  readonly healthcheck: HealthcheckClient;

  /** Runner service client */
  readonly runner: RunnerClient;

  /** Source service client */
  readonly source: SourceClient;

  /** State service client */
  readonly state: StateClient;

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
  let _component: ComponentClient | undefined;
  let _connection: ConnectionClient | undefined;
  let _deployment: DeploymentClient | undefined;
  let _environment: EnvironmentClient | undefined;
  let _healthcheck: HealthcheckClient | undefined;
  let _runner: RunnerClient | undefined;
  let _source: SourceClient | undefined;
  let _state: StateClient | undefined;
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

    get component() {
      if (!_component) {
        _component = createConnectClient(ComponentAPI, transport);
      }
      return _component;
    },

    get connection() {
      if (!_connection) {
        _connection = createConnectClient(ConnectionAPI, transport);
      }
      return _connection;
    },

    get deployment() {
      if (!_deployment) {
        _deployment = createConnectClient(DeploymentAPI, transport);
      }
      return _deployment;
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

    get runner() {
      if (!_runner) {
        _runner = createConnectClient(RunnerAPI, transport);
      }
      return _runner;
    },

    get source() {
      if (!_source) {
        _source = createConnectClient(SourceAPI, transport);
      }
      return _source;
    },

    get state() {
      if (!_state) {
        _state = createConnectClient(StateAPI, transport);
      }
      return _state;
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
