export type Entry = {
  id: number;
  name: string;
  note: string;
  createdAt: string;
  contactId: string | null;
};

export type EntryInput = {
  name: string;
  note: string;
  contactId?: string | null;
};

export type ContactLite = {
  id: string;
  name: string;
};
