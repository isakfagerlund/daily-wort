import { ContactLite } from '@/types';

type ParseResult = {
  name: string;
  note: string;
};

const DELIMITERS = ['—', '-', ':'];

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateNote(note: string) {
  if (note.length <= 100) {
    return note;
  }
  return note.slice(0, 100).trim();
}

function findDelimiterIndex(input: string) {
  for (const delimiter of DELIMITERS) {
    const index = input.indexOf(delimiter);
    if (index >= 0) {
      return { index, delimiter };
    }
  }
  return null;
}

function collectTokens(input: string): string[] {
  return input.split(' ').filter(Boolean);
}

export function parseNameNote(
  rawInput: string,
  contactsIndex?: Map<string, ContactLite>
): ParseResult {
  const normalized = collapseWhitespace(rawInput);
  if (!normalized) {
    return { name: '', note: '' };
  }

  const delimiterInfo = findDelimiterIndex(normalized);
  if (delimiterInfo) {
    const { index, delimiter } = delimiterInfo;
    const name = collapseWhitespace(normalized.slice(0, index));
    const note = collapseWhitespace(normalized.slice(index + delimiter.length));
    return {
      name,
      note: truncateNote(note)
    };
  }

  const tokens = collectTokens(normalized);
  const lowered = tokens.map((token) => token.toLowerCase());

  if (contactsIndex && contactsIndex.size > 0) {
    for (let length = Math.min(3, tokens.length); length >= 1; length -= 1) {
      const candidateTokens = tokens.slice(0, length);
      if (candidateTokens.every((token) => /^[A-Z][\w'.-]*$/.test(token))) {
        const candidate = candidateTokens.join(' ');
        const match = contactsIndex.get(candidate.toLowerCase());
        if (match) {
          const note = collapseWhitespace(tokens.slice(length).join(' '));
          return { name: match.name, note: truncateNote(note) };
        }
      }
    }
  }

  const firstCapitalIndex = lowered.findIndex((token, index) => {
    const original = tokens[index];
    return /^[A-Z]/.test(original);
  });

  if (firstCapitalIndex >= 0) {
    const name = tokens[firstCapitalIndex];
    const note = collapseWhitespace(tokens.slice(firstCapitalIndex + 1).join(' '));
    return { name, note: truncateNote(note) };
  }

  const name = tokens[0];
  const note = collapseWhitespace(tokens.slice(1).join(' '));
  return { name, note: truncateNote(note) };
}
