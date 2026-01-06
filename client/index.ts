// Client
export { createClient, type Client } from "./client.js";

// Configuration
export { type ClientConfig, DEFAULT_CONFIG, resolveConfig } from "./lib/config.js";

// Token utilities
export {
  type JWTClaims,
  type TokenValidation,
  parseJWTToken,
  validateAuthToken,
  isTokenExpired,
  isTokenNotYetValid,
  tokenExpiresIn,
  getTokenInfo,
} from "./lib/auth.js";

// Transport (for advanced use cases)
export { createTransport } from "./lib/transport.js";
