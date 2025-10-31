import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { ensureDatabase, runSql, runWriteSql } from '@/lib/db';
import { Entry, EntryInput } from '@/types';

function mapRow(row: Record<string, unknown>): Entry {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    note: String(row.note ?? ''),
    createdAt: String(row.createdAt ?? ''),
    contactId: row.contactId ? String(row.contactId) : null
  };
}

export async function getEntryById(id: number): Promise<Entry | null> {
  await ensureDatabase();
  const result = await runSql('SELECT * FROM entries WHERE id = ?', [id]);
  const rows = (result.rows as any)._array as Record<string, unknown>[];
  if (!rows || rows.length === 0) {
    return null;
  }
  return mapRow(rows[0]);
}

export async function linkEntryToContact(id: number, contactId: string | null) {
  await ensureDatabase();
  await runWriteSql('UPDATE entries SET contactId = ? WHERE id = ?', [contactId, id]);
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecent = useCallback(async () => {
    setLoading(true);
    try {
      await ensureDatabase();
      const result = await runSql(
        'SELECT * FROM entries ORDER BY datetime(createdAt) DESC LIMIT 20'
      );
      const rows = (result.rows as any)._array as Record<string, unknown>[];
      setEntries(rows ? rows.map(mapRow) : []);
    } catch (error) {
      console.warn('Failed to load entries', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useFocusEffect(
    useCallback(() => {
      loadRecent();
    }, [loadRecent])
  );

  const addEntry = useCallback(
    async (input: EntryInput) => {
      if (!input.name.trim() && !input.note.trim()) {
        return null;
      }

      const createdAt = new Date().toISOString();
      await ensureDatabase();
      const result = await runWriteSql(
        'INSERT INTO entries (name, note, createdAt, contactId) VALUES (?, ?, ?, ?)',
        [input.name.trim(), input.note.trim(), createdAt, input.contactId ?? null]
      );
      const insertId = (result.insertId as number) ?? null;
      await loadRecent();
      return insertId;
    },
    [loadRecent]
  );

  const refresh = useCallback(() => {
    loadRecent();
  }, [loadRecent]);

  return {
    entries,
    loading,
    addEntry,
    refresh
  };
}
