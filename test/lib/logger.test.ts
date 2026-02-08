import { logger } from '../../src/lib/logger';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('Logger Sanitization', () => {
  let output: string;

  beforeEach(() => {
    output = '';
    console.log = (msg: string) => {
      output = msg;
    };
    console.warn = (msg: string) => {
      output = msg;
    };
    console.error = (msg: string) => {
      output = msg;
    };
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  it('should redact sensitive keys in info logs', () => {
    logger.info('Test login', { email: 'user@example.com', ip: '192.168.1.1' });
    const parsed = JSON.parse(output);
    expect(parsed.email).toBe('[REDACTED]');
    expect(parsed.ip).toBe('[REDACTED]');
    expect(parsed.message).toBe('Test login');
  });

  it('should redact sensitive keys in nested objects', () => {
    logger.info('Nested test', { user: { password: 'secret123', name: 'John' } });
    const parsed = JSON.parse(output);
    // Note: The sanitize implementation creates a shallow copy for the root,
    // but for nested objects it calls sanitize recursively which returns a new object.
    // However, `sanitized[key] = sanitize(...)` replaces the reference.
    expect(parsed.user.password).toBe('[REDACTED]');
    expect(parsed.user.name).toBe('John');
  });

  it('should not alter non-sensitive data', () => {
    logger.info('Safe log', { status: 'active', id: 123 });
    const parsed = JSON.parse(output);
    expect(parsed.status).toBe('active');
    expect(parsed.id).toBe(123);
  });

  it('should log warnings', () => {
    logger.warn('Warning message');
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('Warning message');
  });

  it('should log errors', () => {
    logger.error('Error message');
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('Error message');
  });
});
