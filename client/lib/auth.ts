/**
 * Standard JWT claims.
 */
export interface JWTClaims {
  /** Issuer */
  iss?: string;
  /** Subject */
  sub?: string;
  /** Audience */
  aud?: string | string[];
  /** Expiration time (Unix timestamp) */
  exp?: number;
  /** Not before (Unix timestamp) */
  nbf?: number;
  /** Issued at (Unix timestamp) */
  iat?: number;
  /** JWT ID */
  jti?: string;
}

/**
 * Token validation result.
 */
export interface TokenValidation {
  valid: boolean;
  error?: string;
  claims?: JWTClaims;
}

/**
 * Decodes a base64url string.
 */
function base64UrlDecode(input: string): string {
  // Replace base64url characters with base64 characters
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if necessary
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Parses a JWT token and extracts claims without validating the signature.
 * This is sufficient for basic format validation and expiration checking.
 */
export function parseJWTToken(token: string): JWTClaims {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`);
  }

  const payload = parts[1];
  if (!payload) {
    throw new Error("Invalid token format: missing payload");
  }

  try {
    const decoded = base64UrlDecode(payload);
    return JSON.parse(decoded) as JWTClaims;
  } catch (err) {
    throw new Error(`Failed to parse token payload: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Checks if the token is expired based on the exp claim.
 */
export function isTokenExpired(claims: JWTClaims): boolean {
  if (!claims.exp) {
    return false; // No expiration set
  }
  return Date.now() >= claims.exp * 1000;
}

/**
 * Checks if the token is not yet valid based on the nbf claim.
 */
export function isTokenNotYetValid(claims: JWTClaims): boolean {
  if (!claims.nbf) {
    return false; // No nbf claim set
  }
  return Date.now() < claims.nbf * 1000;
}

/**
 * Returns the duration in milliseconds until the token expires.
 */
export function tokenExpiresIn(claims: JWTClaims): number {
  if (!claims.exp) {
    return 0; // No expiration
  }
  return claims.exp * 1000 - Date.now();
}

/**
 * Validates the format and expiration of an auth token.
 * Assumes the token is a JWT but gracefully handles non-JWT tokens.
 */
export function validateAuthToken(token: string): TokenValidation {
  if (!token) {
    return { valid: false, error: "Auth token is empty" };
  }

  // Remove Bearer prefix if present
  const actualToken = token.replace(/^Bearer\s+/i, "");

  // If it doesn't look like a JWT (no dots), treat it as an opaque token
  if (!actualToken.includes(".")) {
    if (actualToken.length < 10) {
      return { valid: false, error: `Token appears too short (length: ${actualToken.length})` };
    }
    return { valid: true }; // Assume opaque token is valid
  }

  // Parse as JWT
  let claims: JWTClaims;
  try {
    claims = parseJWTToken(actualToken);
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Check if token is expired
  if (isTokenExpired(claims)) {
    const expDate = claims.exp ? new Date(claims.exp * 1000).toISOString() : "unknown";
    return { valid: false, error: `Token expired at ${expDate}`, claims };
  }

  // Check if token is not yet valid
  if (isTokenNotYetValid(claims)) {
    const nbfDate = claims.nbf ? new Date(claims.nbf * 1000).toISOString() : "unknown";
    return { valid: false, error: `Token not yet valid until ${nbfDate}`, claims };
  }

  return { valid: true, claims };
}

/**
 * Gets token info including claims and expiration status.
 */
export function getTokenInfo(token: string): {
  claims: JWTClaims;
  isExpired: boolean;
  expiresIn: number;
} {
  const actualToken = token.replace(/^Bearer\s+/i, "");
  const claims = parseJWTToken(actualToken);

  return {
    claims,
    isExpired: isTokenExpired(claims),
    expiresIn: tokenExpiresIn(claims),
  };
}
