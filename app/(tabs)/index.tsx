import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Link } from 'expo-router';

import { CaptureBar } from '@/components/CaptureBar';
import { useContacts } from '@/hooks/useContacts';
import { useEntries } from '@/hooks/useEntries';
import { useSpeech } from '@/hooks/useSpeech';
import { parseNameNote } from '@/lib/parse';
import { Entry } from '@/types';

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const { entries, loading, addEntry, refresh } = useEntries();
  const { contactsIndex } = useContacts();

  const handleSaved = useCallback((name: string) => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    setConfirmation(`${name || 'Entry'} saved • ${formatted}`);
  }, []);

  const handleSubmit = useCallback(
    async (override?: string) => {
      const text = override ?? inputValue;
      const { name, note } = parseNameNote(text, contactsIndex);
      if (!name && !note) {
        return;
      }
      await addEntry({ name, note });
      setInputValue('');
      handleSaved(name);
    },
    [addEntry, contactsIndex, handleSaved, inputValue]
  );

  const speech = useSpeech({
    onText: setInputValue,
    onFinal: (text) => {
      if (text.trim().length > 0) {
        handleSubmit(text);
      }
    }
  });

  useEffect(() => {
    if (!confirmation) {
      return;
    }
    const timer = setTimeout(() => setConfirmation(null), 2500);
    return () => clearTimeout(timer);
  }, [confirmation]);

  const micEnabled = useMemo(
    () => speech.isSupported && !speech.error,
    [speech.error, speech.isSupported]
  );

  const renderItem = useCallback(({ item }: { item: Entry }) => {
    return (
      <Link href={{ pathname: '/entry/[id]', params: { id: String(item.id) } }} asChild>
        <TouchableOpacity style={styles.entryItem}>
          <Text style={styles.entryName}>{item.name}</Text>
          {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
          <Text style={styles.entryDate}>
            {new Date(item.createdAt).toLocaleString([], {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  }, []);

  return (
    <View style={styles.container}>
      <CaptureBar
        value={inputValue}
        placeholder="Jeremy — met at networking"
        onChangeText={setInputValue}
        onSubmit={() => handleSubmit()}
        onMicPress={() => speech.toggle()}
        isRecording={speech.isRecording}
        micEnabled={micEnabled}
      />
      {speech.error ? <Text style={styles.errorText}>{speech.error}</Text> : null}
      {confirmation ? <Text style={styles.confirmation}>{confirmation}</Text> : null}
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet. Capture your first memory above.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff'
  },
  errorText: {
    color: '#c1121f',
    marginBottom: 8
  },
  confirmation: {
    color: '#1f7a1f',
    marginBottom: 12
  },
  entryItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0'
  },
  entryName: {
    fontSize: 17,
    fontWeight: '600'
  },
  entryNote: {
    fontSize: 15,
    color: '#444444',
    marginTop: 4
  },
  entryDate: {
    marginTop: 6,
    fontSize: 13,
    color: '#777777'
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
    color: '#999999'
  }
});
