import "server-only";

type LogLevel = "info" | "warn" | "error";

interface LogEntry extends Record<string, unknown> {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const sensitiveKeyPattern =
  /password|token|secret|authorization|cookie|email|phone|address|databaseUrl/i;

export function writeLog(
  level: LogLevel,
  message: string,
  context: Record<string, unknown> = {},
): void {
  const logEntry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitizeLogContext(context),
  };

  const serializedLog = JSON.stringify(logEntry);

  if (level === "error") {
    console.error(serializedLog);
    return;
  }

  if (level === "warn") {
    console.warn(serializedLog);
    return;
  }

  console.info(serializedLog);
}

function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[REDACTED]" : value,
    ]),
  );
}
