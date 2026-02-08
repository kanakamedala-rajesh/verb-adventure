import { getRandomDistractors, getRank, normalize } from '../../src/lib/verbs';

describe('getRandomDistractors', () => {
  it('should return the correct number of distractors', () => {
    const distractors = getRandomDistractors('awoke', 'simple', 3);
    expect(distractors).toHaveLength(3);
  });

  it('should not include the correct answer', () => {
    const correct = 'awoke';
    const distractors = getRandomDistractors(correct, 'simple', 10);
    expect(distractors).not.toContain(correct);
  });

  it('should return different results on subsequent calls (probabilistic)', () => {
    // This test relies on probability. With enough items, the chance of exact same order is tiny.
    const run1 = getRandomDistractors('awoke', 'simple', 5);
    const run2 = getRandomDistractors('awoke', 'simple', 5);

    // We check if the arrays are NOT identical in content and order
    // A simple way is to check if JSON stringified versions are different
    expect(JSON.stringify(run1)).not.toEqual(JSON.stringify(run2));
  });
});

describe('normalize', () => {
  it('should trim and lowercase text', () => {
    expect(normalize('  Hello  ')).toBe('hello');
    expect(normalize('TEST')).toBe('test');
    expect(normalize('')).toBe('');
  });
});

describe('getRank', () => {
  it('should return Legendary for 100%', () => {
    expect(getRank(100).title).toBe('Legendary Word Hero');
  });

  it('should return Super Scholar for 80-99%', () => {
    expect(getRank(80).title).toBe('Super Scholar');
    expect(getRank(99).title).toBe('Super Scholar');
  });

  it('should return Verb Wizard for 60-79%', () => {
    expect(getRank(60).title).toBe('Verb Wizard');
    expect(getRank(79).title).toBe('Verb Wizard');
  });

  it('should return Word Explorer for 40-59%', () => {
    expect(getRank(40).title).toBe('Word Explorer');
    expect(getRank(59).title).toBe('Word Explorer');
  });

  it('should return Awesome Beginner for <40%', () => {
    expect(getRank(0).title).toBe('Awesome Beginner');
    expect(getRank(39).title).toBe('Awesome Beginner');
  });
});
