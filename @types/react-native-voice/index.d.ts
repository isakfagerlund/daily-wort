declare module '@react-native-voice/voice' {
  import { EmitterSubscription } from 'react-native';

  export type SpeechResultsEvent = {
    value?: string[];
  };

  export type SpeechErrorEvent = {
    error?: {
      message?: string;
    };
  };

  export type SpeechStartEvent = Record<string, unknown>;

  export type SpeechEndEvent = Record<string, unknown>;

  class VoiceModule {
    onSpeechStart?: (event: SpeechStartEvent) => void;
    onSpeechEnd?: (event: SpeechEndEvent) => void;
    onSpeechResults?: (event: SpeechResultsEvent) => void;
    onSpeechPartialResults?: (event: SpeechResultsEvent) => void;
    onSpeechError?: (event: SpeechErrorEvent) => void;

    start(locale: string): Promise<void>;
    stop(): Promise<void>;
    destroy(): Promise<void>;
    removeAllListeners(): void;
  }

  const Voice: VoiceModule;
  export default Voice;
}
