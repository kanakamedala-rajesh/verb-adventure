export interface Verb {
  base: string;
  simple: string;
  participle: string;
  difficulty: 'common' | 'advanced';
}

export type QuestionType = 'fill' | 'mcq' | 'tf';

export interface Question {
  id: string;
  verb: Verb;
  type: QuestionType;
  subType?: 'simple' | 'participle';
  correctAnswer?: string;
  options?: string[];
  isTrue?: boolean;
  targetValue?: string;
}

export interface Answer {
  simple?: string;
  participle?: string;
  selected?: string;
}

export const verbsData: Verb[] = [
  { base: 'awake', simple: 'awoke', participle: 'awoken', difficulty: 'advanced' },
  { base: 'beat', simple: 'beat', participle: 'beaten', difficulty: 'common' },
  { base: 'begin', simple: 'began', participle: 'begun', difficulty: 'common' },
  { base: 'bend', simple: 'bent', participle: 'bent', difficulty: 'common' },
  { base: 'blow', simple: 'blew', participle: 'blown', difficulty: 'common' },
  { base: 'break', simple: 'broke', participle: 'broken', difficulty: 'common' },
  { base: 'bring', simple: 'brought', participle: 'brought', difficulty: 'common' },
  { base: 'buy', simple: 'bought', participle: 'bought', difficulty: 'common' },
  { base: 'catch', simple: 'caught', participle: 'caught', difficulty: 'common' },
  { base: 'choose', simple: 'chose', participle: 'chosen', difficulty: 'common' },
  { base: 'come', simple: 'came', participle: 'come', difficulty: 'common' },
  { base: 'do', simple: 'did', participle: 'done', difficulty: 'common' },
  { base: 'draw', simple: 'drew', participle: 'drawn', difficulty: 'common' },
  { base: 'drink', simple: 'drank', participle: 'drunk', difficulty: 'common' },
  { base: 'drive', simple: 'drove', participle: 'driven', difficulty: 'common' },
  { base: 'eat', simple: 'ate', participle: 'eaten', difficulty: 'common' },
  { base: 'fall', simple: 'fell', participle: 'fallen', difficulty: 'common' },
  { base: 'feel', simple: 'felt', participle: 'felt', difficulty: 'common' },
  { base: 'find', simple: 'found', participle: 'found', difficulty: 'common' },
  { base: 'fly', simple: 'flew', participle: 'flown', difficulty: 'common' },
  { base: 'forget', simple: 'forgot', participle: 'forgotten', difficulty: 'common' },
  { base: 'freeze', simple: 'froze', participle: 'frozen', difficulty: 'advanced' },
  { base: 'get', simple: 'got', participle: 'gotten', difficulty: 'common' },
  { base: 'give', simple: 'gave', participle: 'given', difficulty: 'common' },
  { base: 'go', simple: 'went', participle: 'gone', difficulty: 'common' },
  { base: 'grow', simple: 'grew', participle: 'grown', difficulty: 'common' },
  { base: 'hang', simple: 'hung', participle: 'hung', difficulty: 'advanced' },
  { base: 'have', simple: 'had', participle: 'had', difficulty: 'common' },
  { base: 'hear', simple: 'heard', participle: 'heard', difficulty: 'common' },
  { base: 'keep', simple: 'kept', participle: 'kept', difficulty: 'common' },
  { base: 'know', simple: 'knew', participle: 'known', difficulty: 'common' },
  { base: 'leave', simple: 'left', participle: 'left', difficulty: 'common' },
  { base: 'lie', simple: 'lay', participle: 'lain', difficulty: 'advanced' },
  { base: 'make', simple: 'made', participle: 'made', difficulty: 'common' },
  { base: 'put', simple: 'put', participle: 'put', difficulty: 'common' },
  { base: 'read', simple: 'read', participle: 'read', difficulty: 'common' },
  { base: 'ride', simple: 'rode', participle: 'ridden', difficulty: 'common' },
  { base: 'ring', simple: 'rang', participle: 'rung', difficulty: 'common' },
  { base: 'run', simple: 'ran', participle: 'run', difficulty: 'common' },
  { base: 'say', simple: 'said', participle: 'said', difficulty: 'common' },
  { base: 'see', simple: 'saw', participle: 'seen', difficulty: 'common' },
  { base: 'sing', simple: 'sang', participle: 'sung', difficulty: 'common' },
  { base: 'sleep', simple: 'slept', participle: 'slept', difficulty: 'common' },
  { base: 'speak', simple: 'spoke', participle: 'spoken', difficulty: 'common' },
  { base: 'spend', simple: 'spent', participle: 'spent', difficulty: 'common' },
  { base: 'steal', simple: 'stole', participle: 'stolen', difficulty: 'common' },
  { base: 'swim', simple: 'swam', participle: 'swum', difficulty: 'common' },
  { base: 'take', simple: 'took', participle: 'taken', difficulty: 'common' },
  { base: 'think', simple: 'thought', participle: 'thought', difficulty: 'common' },
  { base: 'throw', simple: 'threw', participle: 'thrown', difficulty: 'common' },
  { base: 'wake', simple: 'woke', participle: 'woken', difficulty: 'common' },
  { base: 'wear', simple: 'wore', participle: 'worn', difficulty: 'common' },
  { base: 'write', simple: 'wrote', participle: 'written', difficulty: 'common' },
  { base: 'lose', simple: 'lost', participle: 'lost', difficulty: 'common' }
];

export const normalize = (text: string) => text ? text.trim().toLowerCase() : '';

export const getRandomDistractors = (correctAnswer: string, type: 'simple' | 'participle', count = 3) => {
  const others = verbsData
    .map(v => v[type])
    .filter(a => a !== correctAnswer);
  const shuffled = [...others].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRank = (percentage: number) => {

  if (percentage === 100) return { title: "Legendary Word Hero", icon: "👑", color: "text-yellow-500", message: "PERFECT! You are a word wizard!" };

  if (percentage >= 80) return { title: "Super Scholar", icon: "🌟", color: "text-blue-500", message: "WOW! You know so many verbs!" };

  if (percentage >= 60) return { title: "Verb Wizard", icon: "🧙", color: "text-purple-500", message: "Great job! Keep it up!" };

  if (percentage >= 40) return { title: "Word Explorer", icon: "🧭", color: "text-green-500", message: "Good start! You're learning fast!" };

  return { title: "Awesome Beginner", icon: "🌱", color: "text-orange-500", message: "Keep practicing, you can do it!" };

};


