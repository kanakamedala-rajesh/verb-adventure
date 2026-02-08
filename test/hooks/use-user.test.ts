import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUser } from '../../src/hooks/use-user';

describe('useUser', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null name and not loading after mount', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current.name).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should load name from localStorage', () => {
    localStorage.setItem('verb-adventure-user-name', 'Alice');
    const { result } = renderHook(() => useUser());
    expect(result.current.name).toBe('Alice');
    expect(result.current.isLoading).toBe(false);
  });

  it('should update name', () => {
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.updateName('Bob');
    });

    expect(result.current.name).toBe('Bob');
    expect(localStorage.getItem('verb-adventure-user-name')).toBe('Bob');
  });

  it('should not update with empty name', () => {
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.updateName('  ');
    });

    expect(result.current.name).toBeNull();
    expect(localStorage.getItem('verb-adventure-user-name')).toBeNull();
  });
});
