import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { callGemini } from '../../src/lib/gemini';
import { logger } from '../../src/lib/logger';

// Mock logger to avoid console pollution and check calls
vi.mock('../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      return null;
    },
  }),
}));

const originalFetch = global.fetch;
const originalEnv = process.env;

describe('callGemini', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('should return error message if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await callGemini('Hello');
    expect(result).toBe('AI is currently unavailable. Please check configuration.');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('GEMINI_API_KEY is not set'));
  });

  it('should return AI response on success', async () => {
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: 'AI Response' }] } }],
    };
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await callGemini('Hello');
    expect(result).toBe('AI Response');
    expect(logger.info).toHaveBeenCalledWith('Gemini AI response generated successfully');
  });

  it('should handle rate limiting', async () => {
    // Mock headers to return same IP
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => '1.2.3.4',
    });

    // First call - success (mock)
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Hi' }] } }] }),
    });

    // We need to manipulate the module-level variable `lastCallTimestamps`.
    // Since we can't easily access it, we rely on the behavior.

    // Call 1
    await callGemini('1');

    // Call 2 (Immediate)
    const result = await callGemini('2');

    expect(result).toBe("Whoa there! I'm thinking as fast as I can. Please wait a moment.");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Gemini rate limit hit'),
      expect.objectContaining({ ip: '1.2.x.x' }), // Masked IP check
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => 'API Error',
      status: 500,
    });

    // Use a different IP to avoid rate limit from previous test
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => '5.6.7.8',
    });

    const result = await callGemini('Hello');
    expect(result).toBe('Oops! My AI brain is taking a nap. Please try again later.');
    expect(logger.error).toHaveBeenCalledWith('AI Request failed', expect.any(Object));
  });

  it('should handle fetch exceptions', async () => {
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => '9.9.9.9',
    });
    (global.fetch as unknown as Mock).mockRejectedValue(new Error('Network error'));

    const result = await callGemini('Hello');
    expect(result).toBe('Oops! My AI brain is taking a nap. Please try again later.');
    expect(logger.error).toHaveBeenCalledWith('Gemini Error', expect.any(Object));
  });

  it('should handle missing IP header', async () => {
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => null, // No x-forwarded-for
    });
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Response' }] } }] }),
    });

    const result = await callGemini('Hello');
    expect(result).toBe('Response');
    // Implicitly covers "ip || 'unknown'"
  });

  it('should handle malformed API response (no candidates)', async () => {
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => '10.10.10.10',
    });
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] }), // Empty candidates
    });

    const result = await callGemini('Hello');
    expect(result).toBe("Sorry, I couldn't generate that right now.");
  });

  it('should handle non-Error exceptions', async () => {
    const { headers } = await import('next/headers');
    (headers as unknown as Mock).mockResolvedValue({
      get: () => '11.11.11.11',
    });
    (global.fetch as unknown as Mock).mockRejectedValue('String Error');

    const result = await callGemini('Hello');
    expect(result).toBe('Oops! My AI brain is taking a nap. Please try again later.');
    expect(logger.error).toHaveBeenCalledWith(
      'Gemini Error',
      expect.objectContaining({ error: 'String Error' }),
    );
  });
});
