import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStats } from '../../src/hooks/use-stats';

describe('useStats', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default stats', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual({
      bestScore: 0,
      totalCorrect: 0,
      totalAttempted: 0,
      gamesPlayed: 0,
      lastRank: 'Beginner',
    });
  });

  it('should load stats from localStorage', () => {
    const savedStats = {
      bestScore: 80,
      totalCorrect: 10,
      totalAttempted: 12,
      gamesPlayed: 1,
      lastRank: 'Verb Wizard',
    };
    localStorage.setItem('verb-adventure-stats', JSON.stringify(savedStats));

    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual(savedStats);
  });

  it('should handle invalid JSON in localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('verb-adventure-stats', 'invalid-json');

    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual({
      bestScore: 0,
      totalCorrect: 0,
      totalAttempted: 0,
      gamesPlayed: 0,
      lastRank: 'Beginner',
    });
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load stats', expect.any(Error));
  });

  it('should update stats correctly', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.updateStats(8, 10, 'Super Scholar');
    });

    const expected = {
      bestScore: 80,
      totalCorrect: 8,
      totalAttempted: 10,
      gamesPlayed: 1,
      lastRank: 'Super Scholar',
    };

    expect(result.current.stats).toEqual(expected);
    expect(localStorage.getItem('verb-adventure-stats')).toBe(JSON.stringify(expected));

    // Update again to check accumulation and best score
    act(() => {
      // Score 5/10 (50%), should NOT update bestScore (80)
      result.current.updateStats(5, 10, 'Word Explorer');
    });

    const expected2 = {
      bestScore: 80,
      totalCorrect: 13,
      totalAttempted: 20,
      gamesPlayed: 2,
      lastRank: 'Word Explorer',
    };
    expect(result.current.stats).toEqual(expected2);
  });
});
