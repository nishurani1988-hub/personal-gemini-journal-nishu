export type JournalMode = 'mindful' | 'brainstorm' | 'clarity' | 'gratitude' | 'freeform';

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: JournalMode;
  messages: JournalMessage[];
  summary: string;
  keyTakeaways: string[];
  primaryMood: string;
  moodEmoji: string;
  moodScore: number; // 1 to 10
  energyLevel: 'High' | 'Moderate' | 'Low';
  themes: string[];
  reflectionPrompt?: string;
  isFavorite?: boolean;
  wordCount: number;
}

export interface PersonalizedPrompt {
  id: string;
  prompt: string;
  theme: string;
  mode: JournalMode;
  reasoning: string;
}

export interface MoodInsightReport {
  overallSentiment: string;
  weeklyTrendSummary: string;
  averageMoodScore: number;
  dominantMood: string;
  topThemes: { name: string; count: number; sentiment: string }[];
  emotionalHighlights: string[];
  growthAdvice: string;
  personalizedPrompts: PersonalizedPrompt[];
  calculatedAt: number;
  analyzedEntriesCount: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
