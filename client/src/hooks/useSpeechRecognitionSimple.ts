import { useState, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  silenceTimeout?: number;
}

export function useSpeechRecognitionSimple(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = useCallback(() => {
    try {
      // Get the Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        const error = 'Speech Recognition not supported in this browser';
        console.error(error);
        options.onError?.(error);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onstart = () => {
        console.log('[Speech] Recognition started');
        setIsListening(true);
        setTranscript('');
        finalTranscript = '';
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Auto-stop after silence
        if (options.silenceTimeout) {
          silenceTimeoutRef.current = setTimeout(() => {
            recognition.stop();
          }, options.silenceTimeout);
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        console.error('[Speech] Error:', errorMessage);
        options.onError?.(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('[Speech] Recognition ended');
        setIsListening(false);
        
        if (finalTranscript.trim()) {
          options.onTranscript?.(finalTranscript.trim());
        }

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };

      recognition.start();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Speech] Start error:', errorMessage);
      options.onError?.(errorMessage);
      setIsListening(false);
    }
  }, [options]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      setIsListening(false);
    } catch (error) {
      console.error('[Speech] Stop error:', error);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeaking: isListening,
  };
}
