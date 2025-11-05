// Production-Safe Logging Utility
// Prevents sensitive data from being logged in production

type LogLevel = 'log' | 'info' | 'warn' | 'error';

/**
 * Safe logger that only logs in development mode
 * In production, only errors are logged (without sensitive data)
 */
export const logger = {
  /**
   * Debug/info logging - only in development
   */
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  /**
   * Info logging - only in development
   */
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },

  /**
   * Warning logging - only in development
   */
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },

  /**
   * Error logging - always logged but sanitized in production
   */
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    } else {
      // In production, log only the error message without stack traces or sensitive data
      console.error(message);
    }
  },
};

/**
 * Sanitize sensitive data from logs (for production error reporting)
 */
export function sanitizeForLog(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const key in data) {
    const lowerKey = key.toLowerCase();

    // Remove sensitive fields
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('key') ||
      lowerKey.includes('auth')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object') {
      sanitized[key] = sanitizeForLog(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}
