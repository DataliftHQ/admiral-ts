# admiral-ts

TypeScript client library for the Admiral API.

## Installation

```bash
npm install @admiral-io/sdk
```

## Usage

```typescript
import { createClient } from "@admiral-io/sdk";

const client = createClient({
  baseUrl: "https://api.admiral.io",
  authToken: "your-token-here",
});

// Access services via properties
// await client.cluster.methodName({ ... });
// await client.runner.methodName({ ... });
// await client.user.methodName({ ... });
// await client.application.methodName({ ... });
// await client.component.methodName({ ... });
// await client.connection.methodName({ ... });
// await client.deployment.methodName({ ... });
// await client.environment.methodName({ ... });
// await client.healthcheck.methodName({ ... });
// await client.source.methodName({ ... });
// await client.state.methodName({ ... });
// await client.variable.methodName({ ... });
```

## Available Services

| Service | Property | Description |
|---------|----------|-------------|
| ClusterAPI | `client.cluster` | Cluster service |
| RunnerAPI | `client.runner` | Runner service |
| UserAPI | `client.user` | User service |
| ApplicationAPI | `client.application` | Application service |
| ComponentAPI | `client.component` | Component service |
| ConnectionAPI | `client.connection` | Connection service |
| DeploymentAPI | `client.deployment` | Deployment service |
| EnvironmentAPI | `client.environment` | Environment service |
| HealthcheckAPI | `client.healthcheck` | Healthcheck service |
| SourceAPI | `client.source` | Source service |
| StateAPI | `client.state` | State service |
| VariableAPI | `client.variable` | Variable service |

## Example

```typescript
import { createClient } from "@admiral-io/sdk";

async function main() {
  const client = createClient({
    baseUrl: "https://api.admiral.io",
    authToken: process.env.ADMIRAL_TOKEN,
  });

  // Validate token before making requests
  const validation = client.validateToken();
  if (!validation.valid) {
    throw new Error(`Invalid token: ${validation.error}`);
  }

  // Call a service method
  try {
    const response = await client.cluster.listMethod({});
    console.log(response);
  } catch (err) {
    console.error("Request failed:", err);
  }
}

main();
```

## Configuration

```typescript
import { createClient, type ClientConfig } from "@admiral-io/sdk";

const config: ClientConfig = {
  // Base URL for the API server
  baseUrl: "https://api.admiral.io",

  // Authentication token (JWT)
  authToken: "your-jwt-token",

  // Request timeout in milliseconds (default: 30000)
  timeout: 30000,

  // HTTP version: "1.1" or "2" (default: "2")
  httpVersion: "2",

  // Custom headers to include in all requests
  headers: {
    "X-Custom-Header": "value",
  },
};

const client = createClient(config);
```

## Token Validation

```typescript
// Validate token format and expiration
const validation = client.validateToken();
if (!validation.valid) {
  console.error("Invalid token:", validation.error);
}

// Get detailed token information
const info = client.getTokenInfo();
if (info) {
  console.log("Subject:", info.claims.sub);
  console.log("Expired:", info.isExpired);
  console.log("Expires in:", info.expiresIn, "ms");
}
```

## Token Utilities

Standalone functions for working with JWT tokens:

```typescript
import {
  parseJWTToken,
  validateAuthToken,
  isTokenExpired,
  isTokenNotYetValid,
  tokenExpiresIn,
  getTokenInfo,
} from "@admiral-io/sdk";

// Parse JWT claims without validation
const claims = parseJWTToken(token);
console.log("Subject:", claims.sub);
console.log("Issuer:", claims.iss);

// Validate token format and timing
const result = validateAuthToken(token);
if (!result.valid) {
  console.error(result.error);
}

// Check expiration status
if (isTokenExpired(claims)) {
  console.log("Token has expired");
}

// Check if token is not yet valid (nbf claim)
if (isTokenNotYetValid(claims)) {
  console.log("Token not yet valid");
}

// Get milliseconds until expiration
const expiresIn = tokenExpiresIn(claims);
console.log("Expires in:", expiresIn, "ms");
```

## Advanced: Direct Transport Access

For advanced use cases, you can access the underlying Connect transport:

```typescript
import { createClient } from "@admiral-io/sdk";
import { createClient as createConnectClient } from "@connectrpc/connect";
import { SomeOtherService } from "./custom-service_pb";

const client = createClient({ ... });

// Use the transport directly with other services
const customClient = createConnectClient(SomeOtherService, client.transport);
```

## Requirements

- Node.js >= 22
- ESM only (no CommonJS support)

## License

MIT License - see [LICENSE](LICENSE.txt) for details.
