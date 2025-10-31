import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent
} from '@react-native-voice/voice';

type UseSpeechOptions = {
  onText: (text: string) => void;
  onFinal?: (text: string) => void;
};

type UseSpeechReturn = {
  isSupported: boolean;
  isRecording: boolean;
  error: string | null;
  toggle: () => Promise<void>;
  stop: () => Promise<void>;
  start: () => Promise<void>;
};

export function useSpeech({ onText, onFinal }: UseSpeechOptions): UseSpeechReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSupported = Platform.OS === 'ios';
  const latestTranscript = useRef('');
  const hasEmittedFinal = useRef(false);

  const emitFinal = useCallback(() => {
    if (hasEmittedFinal.current) {
      return;
    }
    hasEmittedFinal.current = true;
    if (onFinal) {
      onFinal(latestTranscript.current);
    }
  }, [onFinal]);

  const handleStart = useCallback(
    (_event?: SpeechStartEvent) => {
      latestTranscript.current = '';
      hasEmittedFinal.current = false;
      setIsRecording(true);
      setError(null);
    },
    []
  );

  const handleResults = useCallback(
    (event: SpeechResultsEvent) => {
      const text = event.value?.[0] ?? '';
      latestTranscript.current = text;
      onText(text);
    },
    [onText]
  );

  const handlePartial = useCallback(
    (event: SpeechResultsEvent) => {
      const text = event.value?.[0] ?? '';
      latestTranscript.current = text;
      onText(text);
    },
    [onText]
  );

  const handleError = useCallback(
    (event: SpeechErrorEvent) => {
      const message = event.error?.message ?? 'Speech recognition error';
      setError(message);
      setIsRecording(false);
      emitFinal();
    },
    [emitFinal]
  );

  const handleEnd = useCallback(
    (_event?: SpeechEndEvent) => {
      setIsRecording(false);
      emitFinal();
    },
    [emitFinal]
  );

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    Voice.onSpeechStart = handleStart;
    Voice.onSpeechEnd = handleEnd;
    Voice.onSpeechResults = handleResults;
    Voice.onSpeechPartialResults = handlePartial;
    Voice.onSpeechError = handleError;

    return () => {
      Voice.destroy().catch(() => undefined);
      Voice.removeAllListeners();
    };
  }, [handleEnd, handleError, handlePartial, handleResults, handleStart, isSupported]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is only available on iOS.');
      return;
    }
    try {
      setError(null);
      hasEmittedFinal.current = false;
      latestTranscript.current = '';
      await Voice.start('en-US');
    } catch (err) {
      setError((err as Error).message);
      setIsRecording(false);
      emitFinal();
    }
  }, [emitFinal, isSupported]);

  const stop = useCallback(async () => {
    if (!isSupported) {
      return;
    }
    try {
      await Voice.stop();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRecording(false);
      emitFinal();
    }
  }, [emitFinal, isSupported]);

  const toggle = useCallback(async () => {
    if (isRecording) {
      await stop();
    } else {
      await start();
    }
  }, [isRecording, start, stop]);

  return useMemo(
    () => ({
      isSupported,
      isRecording,
      error,
      toggle,
      stop,
      start
    }),
    [error, isRecording, isSupported, start, stop, toggle]
  );
}
