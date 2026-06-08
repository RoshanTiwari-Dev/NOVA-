import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  silenceTimeout?: number;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    onTranscript,
    onError,
    silenceTimeout = 2000,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMsg = 'Speech Recognition API not supported in this browser';
      console.error('[Speech Recognition]', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[Speech Recognition] Started listening');
        setIsListening(true);
        setIsSpeaking(true);
        setError(null);
        setTranscript('');
        resetSilenceTimeout();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + ' ';
          } else {
            interimTranscript += transcriptSegment;
          }
        }

        if (finalTranscript) {
          console.log('[Speech Recognition] Final transcript:', finalTranscript);
          setTranscript((prev) => prev + finalTranscript);
          resetSilenceTimeout();
        }

        if (interimTranscript || finalTranscript) {
          resetSilenceTimeout();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[Speech Recognition] Error:', event.error);
        let errorMsg = `Speech recognition error: ${event.error}`;

        if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please try again.';
        } else if (event.error === 'network') {
          errorMsg = 'Network error. Please check your connection.';
        } else if (event.error === 'not-allowed') {
          errorMsg = 'Microphone access denied. Please grant permission in browser settings.';
        } else if (event.error === 'aborted') {
          errorMsg = 'Speech recognition was aborted.';
        }

        setError(errorMsg);
        onError?.(errorMsg);
        setIsListening(false);
        setIsSpeaking(false);
      };

      recognition.onend = () => {
        console.log('[Speech Recognition] Ended');
        setIsListening(false);
        setIsSpeaking(false);
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };

      recognitionRef.current = recognition;

      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {
            console.error('Error aborting recognition:', e);
          }
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };
    } catch (err) {
      console.error('Error initializing Speech Recognition:', err);
      setError('Failed to initialize microphone');
      onError?.('Failed to initialize microphone');
    }
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        try {
          console.log('[Speech Recognition] Silence detected, stopping...');
          recognitionRef.current.stop();
          setIsListening(false);
          setIsSpeaking(false);
          if (transcript) {
            onTranscript?.(transcript);
          }
        } catch (err) {
          console.error('[Speech Recognition] Silence timeout error:', err);
        }
      }
    }, silenceTimeout);
  }, [silenceTimeout, transcript, isListening, onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech Recognition not initialized';
      console.error('[Speech Recognition]', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      console.log('[Speech Recognition] Starting...');
      setTranscript('');
      setError(null);

      if (!isListening) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('[Speech Recognition] Start error:', err);
      const errorMsg = `Failed to start listening: ${err}`;
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        console.log('[Speech Recognition] Stopping...');
        recognitionRef.current.stop();
        setIsListening(false);
        setIsSpeaking(false);
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        if (transcript) {
          onTranscript?.(transcript);
        }
      } catch (err) {
        console.error('[Speech Recognition] Stop error:', err);
      }
    }
  }, [transcript, onTranscript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
