/**
 * Simple structured logger for production observability.
 */
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

const SENSITIVE_KEYS = ['ip', 'email', 'password', 'token', 'apiKey'];

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key] as Record<string, unknown>);
    }
  }
  return sanitized;
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const safeContext = context ? sanitize(context) : undefined;
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...safeContext,
  });
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(formatLog(LogLevel.INFO, message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(formatLog(LogLevel.WARN, message, context));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(formatLog(LogLevel.ERROR, message, context));
  },
};
