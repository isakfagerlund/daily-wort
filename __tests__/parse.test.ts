import { parseNameNote } from '@/lib/parse';
import { ContactLite } from '@/types';

describe('parseNameNote', () => {
  const mockContacts = new Map<string, ContactLite>([
    ['jeremy fox', { id: '1', name: 'Jeremy Fox' }],
    ['sarah', { id: '2', name: 'Sarah' }]
  ]);

  it('splits on em dash delimiters', () => {
    const result = parseNameNote('Jeremy — met at networking');
    expect(result).toEqual({ name: 'Jeremy', note: 'met at networking' });
  });

  it('splits on colon delimiters', () => {
    const result = parseNameNote('Liz: follow up with deck');
    expect(result).toEqual({ name: 'Liz', note: 'follow up with deck' });
  });

  it('matches existing contacts with multiple tokens', () => {
    const result = parseNameNote('Jeremy Fox intro from meetup', mockContacts);
    expect(result).toEqual({ name: 'Jeremy Fox', note: 'intro from meetup' });
  });

  it('falls back to first capitalized token', () => {
    const result = parseNameNote('remember Sarah from event', mockContacts);
    expect(result).toEqual({ name: 'Sarah', note: 'from event' });
  });

  it('trims messy whitespace and limits note length', () => {
    const longNote = 'A'.repeat(150);
    const input = '  Max   ' + longNote + '  ';
    const result = parseNameNote(input);
    expect(result.name).toBe('Max');
    expect(result.note.length).toBeLessThanOrEqual(100);
  });
});
