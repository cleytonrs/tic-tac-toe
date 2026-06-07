import { describe, it, expect } from 'vitest';
import { validatePlayerName, isValidName, enforceMaxLength } from '../game';

describe('validatePlayerName', () => {
  it('returns trimmed name for valid input', () => {
    expect(validatePlayerName('  Alice  ', 'Player X')).toBe('Alice');
  });

  it('returns the name as-is when already valid and trimmed', () => {
    expect(validatePlayerName('Bob', 'Player O')).toBe('Bob');
  });

  it('returns defaultName for empty string', () => {
    expect(validatePlayerName('', 'Player X')).toBe('Player X');
  });

  it('returns defaultName for whitespace-only input', () => {
    expect(validatePlayerName('   ', 'Player O')).toBe('Player O');
    expect(validatePlayerName('\t\n', 'Player X')).toBe('Player X');
  });

  it('truncates names exceeding 20 characters', () => {
    const longName = 'A'.repeat(25);
    expect(validatePlayerName(longName, 'Player X')).toBe('A'.repeat(20));
  });

  it('allows names exactly 20 characters', () => {
    const exactName = 'A'.repeat(20);
    expect(validatePlayerName(exactName, 'Player X')).toBe(exactName);
  });

  it('allows single character names', () => {
    expect(validatePlayerName('A', 'Player X')).toBe('A');
  });
});

describe('isValidName', () => {
  it('returns true for valid names', () => {
    expect(isValidName('Alice')).toBe(true);
    expect(isValidName('A')).toBe(true);
    expect(isValidName('A'.repeat(20))).toBe(true);
  });

  it('returns true for names with leading/trailing spaces (trimmed is valid)', () => {
    expect(isValidName('  Bob  ')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidName('')).toBe(false);
  });

  it('returns false for whitespace-only input', () => {
    expect(isValidName('   ')).toBe(false);
    expect(isValidName('\t')).toBe(false);
  });

  it('returns false for names exceeding 20 characters after trimming', () => {
    expect(isValidName('A'.repeat(21))).toBe(false);
  });
});

describe('enforceMaxLength', () => {
  it('truncates input value exceeding maxLength', () => {
    const input = { value: 'A'.repeat(25) } as HTMLInputElement;
    enforceMaxLength(input, 20);
    expect(input.value).toBe('A'.repeat(20));
  });

  it('does not modify input value at or below maxLength', () => {
    const input = { value: 'Hello' } as HTMLInputElement;
    enforceMaxLength(input, 20);
    expect(input.value).toBe('Hello');
  });

  it('does not modify input value exactly at maxLength', () => {
    const input = { value: 'A'.repeat(20) } as HTMLInputElement;
    enforceMaxLength(input, 20);
    expect(input.value).toBe('A'.repeat(20));
  });

  it('works with custom maxLength values', () => {
    const input = { value: 'Hello World' } as HTMLInputElement;
    enforceMaxLength(input, 5);
    expect(input.value).toBe('Hello');
  });
});
