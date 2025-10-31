import { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View
} from 'react-native';

type CaptureBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: TextInputProps['onChangeText'];
  onSubmit: () => void;
  onMicPress: () => void;
  isRecording: boolean;
  micEnabled: boolean;
};

export function CaptureBar({
  value,
  placeholder,
  onChangeText,
  onSubmit,
  onMicPress,
  isRecording,
  micEnabled
}: CaptureBarProps) {
  const micLabel = useMemo(() => (isRecording ? '■' : '🎤'), [isRecording]);
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
        returnKeyType="done"
        multiline
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Toggle microphone"
        style={[styles.micButton, !micEnabled && styles.micButtonDisabled]}
        onPress={onMicPress}
        disabled={!micEnabled}
      >
        <Text style={styles.micText}>{micLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingVertical: 4,
    paddingRight: 12
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1b5ef5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  micButtonDisabled: {
    opacity: 0.4
  },
  micText: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 24
  }
});
