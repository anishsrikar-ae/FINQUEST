
export interface Resource {
  title: string;
  type: 'Article' | 'Video' | 'Tool';
  url: string; // We will generate search queries if direct URLs are risky
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
  resources: Resource[];
  quiz: Quiz;
}

export interface Quiz {
  question: string;
  options: string[];
  correct: number;
}

export interface Level {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserProgress {
  completedLessonIds: string[]; // Global history of all completed lesson IDs
  xp: number;
  badges: string[];
  rankIndex: number; // Index in the RANKS array
  completedCategoriesForCurrentRank: string[]; // List of category IDs completed for the CURRENT rank
  language: 'en' | 'te' | 'kn' | 'ml' | 'ta' | 'hi'; 
  inventory: string[]; // IDs of items bought in store
  equippedBanner: string | null; // ID of the currently equipped banner
  equippedMusic: string; // ID of the currently playing music
  unlockedMusic: string[]; // IDs of unlocked music tracks
  notifications: Notification[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface FinancialAdvice {
  summary: string;
  recommendations: string[];
  outlook: 'Bullish' | 'Bearish' | 'Neutral';
}
