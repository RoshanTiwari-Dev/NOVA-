import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

describe('useSpeechRecognition', () => {
  let mockSpeechRecognition: any;
  let recognitionInstance: any;

  beforeEach(() => {
    recognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    mockSpeechRecognition = vi.fn(() => recognitionInstance);
    (window as any).SpeechRecognition = mockSpeechRecognition;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).SpeechRecognition;
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isListening).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should start listening when startListening is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
  });

  it('should stop listening when stopListening is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      result.current.stopListening();
    });

    expect(recognitionInstance.stop).toHaveBeenCalled();
  });

  it('should update transcript when speech is recognized', () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript })
    );

    act(() => {
      result.current.startListening();
    });

    // Simulate speech recognition result
    act(() => {
      recognitionInstance.onstart?.();
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'Hello' }],
          [{ transcript: 'world', isFinal: true }],
        ],
      });
    });

    expect(result.current.transcript).toContain('world');
  });

  it('should reset transcript when resetTranscript is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    act(() => {
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [[{ transcript: 'test', isFinal: true }]],
      });
    });

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
  });

  it('should handle errors gracefully', () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onError })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      recognitionInstance.onerror?.({ error: 'network' });
    });

    expect(result.current.error).toContain('network');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('network'));
  });

  it('should call onTranscript callback when speech ends', () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript, silenceTimeout: 100 })
    );

    act(() => {
      result.current.startListening();
    });

    act(() => {
      recognitionInstance.onstart?.();
      recognitionInstance.onresult?.({
        resultIndex: 0,
        results: [[{ transcript: 'hello', isFinal: true }]],
      });
    });

    // Wait for silence timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(onTranscript).toHaveBeenCalledWith(expect.stringContaining('hello'));
        resolve(undefined);
      }, 150);
    });
  });

  it('should set isListening to true when listening starts', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
      recognitionInstance.onstart?.();
    });

    expect(result.current.isListening).toBe(true);
    expect(result.current.isSpeaking).toBe(true);
  });

  it('should set isListening to false when listening ends', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
      recognitionInstance.onstart?.();
    });

    act(() => {
      recognitionInstance.onend?.();
    });

    expect(result.current.isListening).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should handle unsupported browser gracefully', () => {
    delete (window as any).SpeechRecognition;
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSpeechRecognition({ onError })
    );

    expect(result.current.error).toContain('not supported');
    expect(onError).toHaveBeenCalled();
  });
});
