import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useContacts } from '@/hooks/useContacts';
import { getEntryById, linkEntryToContact } from '@/hooks/useEntries';
import { ContactLite, Entry } from '@/types';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { contacts, permission, requestPermission, search } = useContacts({ autoLoad: true });
  const linkedContactName = useMemo(() => {
    if (!selectedContactId) {
      return 'None';
    }
    const match = contacts.find((contact) => contact.id === selectedContactId);
    return match?.name ?? selectedContactId;
  }, [contacts, selectedContactId]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const numericId = Number(id);
      const fetched = await getEntryById(numericId);
      setEntry(fetched);
      setSelectedContactId(fetched?.contactId ?? null);
      setQuery(fetched?.name ?? '');
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    if (permission === 'granted' && contacts.length > 0) {
      const exact = contacts.find(
        (contact) => contact.name.toLowerCase() === entry.name.toLowerCase()
      );
      if (exact) {
        setSelectedContactId(exact.id);
        setQuery(exact.name);
      }
    }
  }, [contacts, entry, permission]);

  const filteredContacts = useMemo(() => search(query), [query, search]);

  const handleSelect = async (contact: ContactLite) => {
    if (!entry) {
      return;
    }
    await linkEntryToContact(entry.id, contact.id);
    setEntry({ ...entry, contactId: contact.id });
    setSelectedContactId(contact.id);
    setPickerOpen(false);
  };

  const handleClearLink = async () => {
    if (!entry) {
      return;
    }
    await linkEntryToContact(entry.id, null);
    setEntry({ ...entry, contactId: null });
    setSelectedContactId(null);
  };

  const openPicker = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
    setPickerOpen(true);
  };

  if (loading || !entry) {
    return (
      <View style={styles.centered}>
        {loading ? <ActivityIndicator /> : <Text>Entry not found.</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{entry.name}</Text>
        <Text style={styles.label}>Note</Text>
        <Text style={styles.value}>{entry.note || '—'}</Text>
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>{new Date(entry.createdAt).toLocaleString()}</Text>
        <Text style={styles.label}>Linked Contact</Text>
        <Text style={styles.value}>{linkedContactName}</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={openPicker}>
        <Text style={styles.primaryButtonText}>Link to contact…</Text>
      </TouchableOpacity>
      {selectedContactId ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleClearLink}>
          <Text style={styles.secondaryButtonText}>Remove link</Text>
        </TouchableOpacity>
      ) : null}

      {pickerOpen ? (
        <View style={styles.picker}>
          <Text style={styles.pickerTitle}>Search contacts</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Start typing a name"
          />
          {permission === 'denied' ? (
            <Text style={styles.permissionText}>
              Permission denied. Enable contacts access in Settings.
            </Text>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.contactItem, item.id === selectedContactId && styles.selectedContact]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.contactName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.permissionText}>No contacts found.</Text>}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginTop: 12
  },
  value: {
    fontSize: 16,
    color: '#222222'
  },
  primaryButton: {
    backgroundColor: '#1b5ef5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999999',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#333333'
  },
  picker: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dddddd',
    padding: 12,
    maxHeight: 320
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12
  },
  permissionText: {
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 12
  },
  contactItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  selectedContact: {
    backgroundColor: '#e7f0ff'
  },
  contactName: {
    fontSize: 16
  }
});
