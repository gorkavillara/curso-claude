import {
  normalizeTag,
  validateTags,
  TAG_MAX_LENGTH,
  TAGS_MAX_PER_TASK,
} from '../backend/src/models/task';

describe('normalizeTag', () => {
  it('trims and lowercases', () => {
    expect(normalizeTag('  Urgent  ')).toBe('urgent');
    expect(normalizeTag('FOO_BAR')).toBe('foo_bar');
  });

  it('returns empty string for non-strings', () => {
    expect(normalizeTag(undefined)).toBe('');
    expect(normalizeTag(42)).toBe('');
    expect(normalizeTag(null)).toBe('');
  });
});

describe('validateTags', () => {
  it('accepts an empty array', () => {
    expect(validateTags([])).toEqual([]);
  });

  it('normalizes and dedupes (case-insensitive)', () => {
    expect(validateTags(['Urgent', 'urgent', '  URGENT  ', 'home'])).toEqual([
      'urgent',
      'home',
    ]);
  });

  it('rejects non-array input', () => {
    expect(typeof validateTags('urgent')).toBe('string');
    expect(typeof validateTags(null)).toBe('string');
    expect(typeof validateTags({ 0: 'x' })).toBe('string');
  });

  it('rejects non-string elements', () => {
    expect(typeof validateTags(['ok', 3])).toBe('string');
  });

  it('rejects empty / whitespace-only tags', () => {
    expect(typeof validateTags([''])).toBe('string');
    expect(typeof validateTags(['   '])).toBe('string');
  });

  it('rejects tags exceeding max length', () => {
    const tooLong = 'a'.repeat(TAG_MAX_LENGTH + 1);
    expect(typeof validateTags([tooLong])).toBe('string');
  });

  it('rejects tags with invalid characters', () => {
    expect(typeof validateTags(['hello world'])).toBe('string');
    expect(typeof validateTags(['café'])).toBe('string');
    expect(typeof validateTags(['-leading'])).toBe('string');
    expect(typeof validateTags(['has!'])).toBe('string');
  });

  it('accepts hyphen and underscore inside the tag', () => {
    expect(validateTags(['front-end', 'back_end', 'v2'])).toEqual([
      'front-end',
      'back_end',
      'v2',
    ]);
  });

  it('rejects more than the per-task maximum', () => {
    const many = Array.from({ length: TAGS_MAX_PER_TASK + 1 }, (_, i) => `t${i}`);
    expect(typeof validateTags(many)).toBe('string');
  });
});
