import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  voice?: 'female' | 'male' | 'neutral';
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const {
    onStart,
    onEnd,
    onError,
    voice = 'female',
    rate = 1,
    pitch = 1,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>('');

  // Initialize Speech Synthesis
  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) {
      const errorMsg = 'Speech Synthesis API not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [onError]);

  const speak = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis;

      if (!synth) {
        const errorMsg = 'Speech Synthesis API not supported';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Select voice based on preference
      const voices = synth.getVoices();
      let selectedVoice = null;

      if (voice === 'female') {
        selectedVoice = voices.find(
          (v) => v.name.includes('Female') || v.name.includes('female') || v.name.includes('woman')
        ) || voices.find((v) => v.name.includes('Google US English Female')) || voices[1];
      } else if (voice === 'male') {
        selectedVoice = voices.find(
          (v) => v.name.includes('Male') || v.name.includes('male') || v.name.includes('man')
        ) || voices.find((v) => v.name.includes('Google US English')) || voices[0];
      } else {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);
        onStart?.();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        const errorMsg = `Speech synthesis error: ${event.error}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      currentTextRef.current = text;

      synth.speak(utterance);
    },
    [voice, rate, pitch, onStart, onEnd, onError]
  );

  const pause = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth && synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth && synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      onEnd?.();
    }
  }, [onEnd]);

  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    }
  }, [isPlaying, isPaused, pause, resume]);

  return {
    isPlaying,
    isPaused,
    error,
    speak,
    pause,
    resume,
    stop,
    togglePlayPause,
  };
}
