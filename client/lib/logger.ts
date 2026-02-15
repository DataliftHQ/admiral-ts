/** Log levels from least to most severe. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Logger interface — SDK consumers implement this to receive log output. */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/** No-op logger — default, silent. */
export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Creates a logger that writes to the console at the specified level and above.
 *
 * @param minLevel - Minimum level to log (default: "debug")
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * import { createConsoleLogger } from "@admiral-io/sdk";
 *
 * const logger = createConsoleLogger("info"); // suppresses debug messages
 * ```
 */
export function createConsoleLogger(minLevel: LogLevel = "debug"): Logger {
  const minOrder = LOG_LEVEL_ORDER[minLevel];

  function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_ORDER[level] >= minOrder;
  }

  return {
    debug(message: string, ...args: unknown[]) {
      if (shouldLog("debug")) console.debug(message, ...args);
    },
    info(message: string, ...args: unknown[]) {
      if (shouldLog("info")) console.info(message, ...args);
    },
    warn(message: string, ...args: unknown[]) {
      if (shouldLog("warn")) console.warn(message, ...args);
    },
    error(message: string, ...args: unknown[]) {
      if (shouldLog("error")) console.error(message, ...args);
    },
  };
}
