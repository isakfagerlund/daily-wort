import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as Contacts from 'expo-contacts';

import { ContactLite } from '@/types';

type PermissionState = 'unknown' | 'loading' | 'granted' | 'denied';

type UseContactsOptions = {
  autoLoad?: boolean;
};

type UseContactsReturn = {
  contacts: ContactLite[];
  permission: PermissionState;
  requestPermission: () => Promise<void>;
  search: (query: string) => ContactLite[];
  contactsIndex: Map<string, ContactLite>;
};

function toLite(contact: Contacts.Contact): ContactLite | null {
  const name = contact.name ?? contact.displayName ?? '';
  if (!name) {
    return null;
  }
  return { id: contact.id, name };
}

async function loadContacts(): Promise<ContactLite[]> {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Name]
  });
  return data
    .map(toLite)
    .filter((c): c is ContactLite => Boolean(c))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useContacts(options: UseContactsOptions = {}): UseContactsReturn {
  const { autoLoad = false } = options;
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const [permission, setPermission] = useState<PermissionState>('unknown');

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPermission('denied');
      return;
    }
    setPermission('loading');
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === Contacts.PermissionStatus.GRANTED) {
        const loaded = await loadContacts();
        setContacts(loaded);
        setPermission('granted');
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.warn('Failed to load contacts', error);
      setPermission('denied');
    }
  }, []);

  useEffect(() => {
    if (autoLoad && permission === 'unknown') {
      requestPermission().catch(() => {
        setPermission('denied');
      });
    }
  }, [autoLoad, permission, requestPermission]);

  const search = useCallback(
    (query: string) => {
      if (!query) {
        return contacts;
      }
      const normalized = query.trim().toLowerCase();
      return contacts.filter((contact) =>
        contact.name.toLowerCase().includes(normalized)
      );
    },
    [contacts]
  );

  const contactsIndex = useMemo(() => {
    const index = new Map<string, ContactLite>();
    contacts.forEach((contact) => {
      index.set(contact.name.toLowerCase(), contact);
    });
    return index;
  }, [contacts]);

  return {
    contacts,
    permission,
    requestPermission,
    search,
    contactsIndex
  };
}
