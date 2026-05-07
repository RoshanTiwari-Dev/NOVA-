import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  silenceTimeout?: number; // milliseconds of silence before auto-stop
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    onTranscript,
    onError,
    silenceTimeout = 2000, // 2 seconds of silence by default
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMsg = 'Speech Recognition API not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
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
        setTranscript((prev) => prev + finalTranscript);
        resetSilenceTimeout();
      }

      // Reset silence timeout on any speech detected
      if (interimTranscript || finalTranscript) {
        resetSilenceTimeout();
      }
    };

    recognition.onerror = (event: any) => {
      const errorMsg = `Speech recognition error: ${event.error}`;
      setError(errorMsg);
      onError?.(errorMsg);
      setIsListening(false);
      setIsSpeaking(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [onError]);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
        setIsSpeaking(false);
        if (transcript) {
          onTranscript?.(transcript);
        }
      }
    }, silenceTimeout);
  }, [silenceTimeout, transcript, isListening, onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech Recognition not initialized';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const errorMsg = `Failed to start listening: ${err}`;
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsSpeaking(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (transcript) {
        onTranscript?.(transcript);
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
