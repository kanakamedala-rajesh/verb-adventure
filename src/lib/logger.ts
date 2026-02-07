/**
 * Simple structured logger for production observability.
 */
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

function formatLog(level: LogLevel, message: string, context?: Record<string, any>) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(formatLog(LogLevel.INFO, message, context));
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(formatLog(LogLevel.WARN, message, context));
  },
  error: (message: string, context?: Record<string, any>) => {
    console.error(formatLog(LogLevel.ERROR, message, context));
  },
};
