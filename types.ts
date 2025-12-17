
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

export interface UserProgress {
  completedLessonIds: string[];
  xp: number;
  badges: string[];
  completedRoadmapTitles: string[];
  language: 'en' | 'te' | 'kn' | 'ml' | 'ta' | 'hi'; 
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
