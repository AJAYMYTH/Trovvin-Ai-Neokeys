import { useState, useEffect, useRef, useCallback } from 'react';

// This is to satisfy TypeScript, as the SpeechRecognition API is not yet standardized
// and might not be available on the window object type.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

interface UseSpeechToTextOptions {
  onTranscript: (transcript: string) => void;
}

/**
 * A custom hook for handling Speech-to-Text functionality using the Web Speech API.
 * This hook is designed to be robust against common API flakiness, such as network errors,
 * by creating a new recognition instance for each listening session and providing error feedback.
 */
export const useSpeechToText = ({ onTranscript }: UseSpeechToTextOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const errorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Check for API support and perform cleanup on unmount.
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    return () => {
      // Ensure any active recognition is stopped on component unmount.
      recognitionRef.current?.stop();
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    if (isListening) {
      recognitionRef.current?.stop();
      // The `onend` event will handle setting `isListening` to false.
    } else {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        const errorMsg = "Speech Recognition API is not supported in this browser.";
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false; // Stop after a pause.
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setError(null); // Clear any previous errors on successful start
        };

        // onend is the final event, fired after recognition stops for any reason.
        recognition.onend = () => {
          // This might be redundant if an error already occurred, but it's safe.
          setIsListening(false);
          recognitionRef.current = null; // Clean up the instance.
        };

        recognition.onerror = (event: any) => {
          const errorMsg = `Speech recognition failed: ${event.error}. Please try again.`;
          console.error(`Speech recognition error: ${event.error}`, event);
          setError(errorMsg);
          errorTimeoutRef.current = window.setTimeout(() => setError(null), 5000);
          
          // Defensively reset state here. This ensures that even if the `onend` event
          // doesn't fire after an error (which can happen across browsers), the
          // application state is corrected, allowing the user to try again.
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          if (transcript) {
            onTranscriptRef.current(transcript);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        const errorMsg = "Could not start listening. Please grant microphone permission.";
        console.error("Failed to start Speech Recognition:", err);
        setError(errorMsg);
        errorTimeoutRef.current = window.setTimeout(() => setError(null), 5000);
      }
    }
  }, [isListening]);

  return {
    isListening,
    toggleListening,
    isSupported,
    error,
  };
};