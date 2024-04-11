import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'en-US', onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);

  // Always keep the latest callback in the ref
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    // Clear any pending restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // Stop existing instance first
    if (recognitionRef.current) {
      shouldRestartRef.current = false;
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev ? `${prev} ${final}` : final);
        onResultRef.current?.(final.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return;
      // 'no-speech' is normal — Chrome fires this after ~5-8s of silence.
      // We let onend handle the restart instead of killing the session.
      if (event.error === 'no-speech') return;

      console.warn('Speech recognition error:', event.error);
      // Only kill on fatal errors (network, not-allowed, etc.)
      if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        shouldRestartRef.current = false;
      }
    };

    recognition.onend = () => {
      // Clear any stale interim text on end
      setInterimTranscript('');

      if (shouldRestartRef.current) {
        // Restart after a brief delay to avoid rapid start/stop loops
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          if (shouldRestartRef.current && SpeechRecognitionAPI) {
            try {
              const newRecognition = new SpeechRecognitionAPI();
              newRecognition.continuous = true;
              newRecognition.interimResults = true;
              newRecognition.lang = lang;
              newRecognition.maxAlternatives = 1;
              newRecognition.onstart = recognition.onstart;
              newRecognition.onresult = recognition.onresult;
              newRecognition.onerror = recognition.onerror;
              newRecognition.onend = recognition.onend;
              recognitionRef.current = newRecognition;
              newRecognition.start();
            } catch {
              setIsListening(false);
              shouldRestartRef.current = false;
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI, lang]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;

    // Clear any pending restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      // Use stop() (not abort()) so the browser fires a final onresult
      // with any pending interim text promoted to final
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
