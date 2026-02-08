import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAudio } from '../../src/hooks/use-audio';

// Mock Web Audio API
const mockAudioContextInstance = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  })),
  destination: {},
  currentTime: 0,
};

const audioContextConstructorSpy = vi.fn();

class MockAudioContext {
  constructor() {
    audioContextConstructorSpy();
  }
  createOscillator = mockAudioContextInstance.createOscillator;
  createGain = mockAudioContextInstance.createGain;
  destination = mockAudioContextInstance.destination;
  currentTime = mockAudioContextInstance.currentTime;
}

// Mock Speech Synthesis
const mockSpeechSynthesis = {
  getVoices: vi.fn().mockReturnValue([]),
  speak: vi.fn(),
  cancel: vi.fn(),
  onvoiceschanged: null,
};

const mockUtterance = vi.fn();
global.SpeechSynthesisUtterance = mockUtterance as unknown as {
  new (text?: string): SpeechSynthesisUtterance;
  prototype: SpeechSynthesisUtterance;
};

describe('useAudio', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Setup global mocks
    global.window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    global.window.speechSynthesis = mockSpeechSynthesis as unknown as SpeechSynthesis;
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should toggle mute and persist', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(localStorage.getItem('verbMasterMuted')).toBe('true');

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(false);
  });

  it('should load settings from localStorage', () => {
    localStorage.setItem('verbMasterMuted', 'true');
    localStorage.setItem('verbMasterVoiceURI', 'Google US English');
    localStorage.setItem('verbMasterSpeed', '1.5');

    const { result } = renderHook(() => useAudio());
    expect(result.current.isMuted).toBe(true);
    expect(result.current.selectedVoiceURI).toBe('Google US English');
    expect(result.current.speed).toBe(1.5);
  });

  it('should change voice and persist', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.changeVoice('New Voice');
    });

    expect(result.current.selectedVoiceURI).toBe('New Voice');
    expect(localStorage.getItem('verbMasterVoiceURI')).toBe('New Voice');
  });

  it('should change speed and persist', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.changeSpeed(1.2);
    });

    expect(result.current.speed).toBe(1.2);
    expect(localStorage.getItem('verbMasterSpeed')).toBe('1.2');
  });

  it('should play sound when not muted', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playSound('correct');
    });

    expect(audioContextConstructorSpy).toHaveBeenCalled();
    expect(mockAudioContextInstance.createOscillator).toHaveBeenCalled();
  });

  it('should NOT play sound when muted', () => {
    localStorage.setItem('verbMasterMuted', 'true');
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playSound('correct');
    });

    expect(audioContextConstructorSpy).not.toHaveBeenCalled();
  });

  it('should call speak and handle events', () => {
    const { result } = renderHook(() => useAudio());

    // Capture the utterance passed to speak
    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    act(() => {
      result.current.speak('Hello');
    });

    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false); // Initially false until start

    // Simulate events
    act(() => {
      capturedUtterance.onstart?.(new Event('start'));
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      capturedUtterance.onend?.(new Event('end'));
    });
    expect(result.current.isSpeaking).toBe(false);

    // Test error case
    act(() => {
      capturedUtterance.onstart?.(new Event('start'));
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      capturedUtterance.onerror?.(new Event('error'));
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should use fallback voice if selected is not found', () => {
    // Setup voices
    const voices = [
      { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us' },
      { name: 'Microsoft Heera', lang: 'en-IN', voiceURI: 'microsoft-heera' },
    ];
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);

    const { result } = renderHook(() => useAudio());

    // Force voices to load
    act(() => {
      // Trigger the effect by simulating voiceschanged if needed,
      // but we mocked getVoices return value before renderHook, so initial effect should pick it up.
      // Wait, voicesRef is used in speak.
    });

    // Capture utterance
    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    // Select a non-existent voice
    act(() => {
      result.current.changeVoice('non-existent-voice');
    });

    // Speak
    act(() => {
      result.current.speak('Hello');
    });

    // Should fallback to Microsoft Heera (priority in fallback list)
    expect(capturedUtterance!.voice!.voiceURI).toBe('microsoft-heera');
  });

  it('should fallback to Google Female if Heera missing', () => {
    const voices = [{ name: 'Google US English Female', lang: 'en-US', voiceURI: 'google-female' }];
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);

    const { result } = renderHook(() => useAudio());

    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    act(() => {
      result.current.speak('Hi');
    });

    expect(capturedUtterance!.voice!.voiceURI).toBe('google-female');
  });

  it('should fallback to any en-IN voice', () => {
    const voices = [{ name: 'Random Voice', lang: 'en-IN', voiceURI: 'random-in' }];
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);

    const { result } = renderHook(() => useAudio());

    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    act(() => {
      result.current.speak('Hi');
    });

    expect(capturedUtterance!.voice!.voiceURI).toBe('random-in');
  });

  it('should fallback to any English voice', () => {
    const voices = [{ name: 'Random Voice', lang: 'en-GB', voiceURI: 'random-gb' }];
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);

    const { result } = renderHook(() => useAudio());

    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    act(() => {
      result.current.speak('Hi');
    });

    expect(capturedUtterance!.voice!.voiceURI).toBe('random-gb');
  });

  it('should not throw if no voice matches', () => {
    mockSpeechSynthesis.getVoices.mockReturnValue([]); // No voices
    const { result } = renderHook(() => useAudio());

    let capturedUtterance: SpeechSynthesisUtterance;
    (window.speechSynthesis.speak as unknown as Mock).mockImplementation(
      (u: SpeechSynthesisUtterance) => {
        capturedUtterance = u;
      },
    );

    act(() => {
      result.current.speak('Hi');
    });

    expect(capturedUtterance!.voice).toBeUndefined(); // No voice assigned
  });

  it('should safe return if speech synthesis not available', () => {
    // Save original
    const originalSynthesis = window.speechSynthesis;
    // Delete it
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, writable: true });

    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.speak('Hi');
    });

    // Should not throw, should not call anything on undefined

    // Restore
    Object.defineProperty(window, 'speechSynthesis', { value: originalSynthesis, writable: true });
  });

  it('should load voices on mount', () => {
    const voices = [{ name: 'English', lang: 'en-US', voiceURI: 'en-us' }];
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);

    const { result } = renderHook(() => useAudio());

    expect(result.current.voices).toEqual(voices);
  });
});
