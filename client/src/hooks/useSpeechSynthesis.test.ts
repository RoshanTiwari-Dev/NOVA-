import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechSynthesis } from './useSpeechSynthesis';

describe('useSpeechSynthesis', () => {
  let mockSpeechSynthesis: any;
  let mockUtterance: any;

  beforeEach(() => {
    mockUtterance = {
      rate: 1,
      pitch: 1,
      voice: null,
      onstart: null,
      onend: null,
      onerror: null,
      onpause: null,
      onresume: null,
    };

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speaking: false,
      paused: false,
      getVoices: vi.fn(() => [
        { name: 'Google US English Female', lang: 'en-US' },
        { name: 'Google US English Male', lang: 'en-US' },
      ]),
    };

    (window as any).speechSynthesis = mockSpeechSynthesis;
    (window as any).SpeechSynthesisUtterance = vi.fn((text: string) => {
      return { ...mockUtterance, text };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).speechSynthesis;
    delete (window as any).SpeechSynthesisUtterance;
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should speak when speak is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('Hello world');
    });

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it('should set isPlaying to true when speech starts', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('Hello');
    });

    // Get the utterance that was created
    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onstart?.();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('should set isPlaying to false when speech ends', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onstart?.();
      utterance.onend?.();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should pause speech when pause is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    mockSpeechSynthesis.speaking = true;
    mockSpeechSynthesis.paused = false;

    act(() => {
      result.current.pause();
    });

    expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
  });

  it('should resume speech when resume is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    mockSpeechSynthesis.paused = true;

    act(() => {
      result.current.resume();
    });

    expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
  });

  it('should stop speech when stop is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('Hello');
    });

    act(() => {
      result.current.stop();
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('should toggle play/pause state', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onstart?.();
    });

    mockSpeechSynthesis.speaking = true;
    mockSpeechSynthesis.paused = false;

    act(() => {
      result.current.togglePlayPause();
    });

    expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
  });

  it('should select female voice when voice option is female', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ voice: 'female' })
    );

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;
    expect(utterance.voice).toBeDefined();
  });

  it('should call onStart callback when speech begins', () => {
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useSpeechSynthesis({ onStart })
    );

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onstart?.();
    });

    expect(onStart).toHaveBeenCalled();
  });

  it('should call onEnd callback when speech finishes', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useSpeechSynthesis({ onEnd })
    );

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onstart?.();
      utterance.onend?.();
    });

    expect(onEnd).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSpeechSynthesis({ onError })
    );

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;

    act(() => {
      utterance.onerror?.({ error: 'network' });
    });

    expect(result.current.error).toContain('network');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('network'));
  });

  it('should handle unsupported browser gracefully', () => {
    delete (window as any).speechSynthesis;
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSpeechSynthesis({ onError })
    );

    expect(result.current.error).toContain('not supported');
    expect(onError).toHaveBeenCalled();
  });

  it('should set rate and pitch correctly', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ rate: 1.5, pitch: 1.2 })
    );

    act(() => {
      result.current.speak('Hello');
    });

    const utterance = (window as any).SpeechSynthesisUtterance.mock.results[0].value;
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(1.2);
  });
});
