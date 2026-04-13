export type SkillArea = 'Reading' | 'Writing' | 'Listening' | 'Speaking';

export interface Session {
  id: string;
  title: string;
  skillArea: SkillArea;
  topics: string[];
  source: string;
  createdDate: string;
  nextReviewDate: string;
  reviewCount: number;
  pdfPath?: string;
  notesPath?: string;
}

export interface StudyLog {
  id: string;
  sessionId: string;
  date: string;
  duration: number;
  exerciseCount: number;
  confidenceLevel: number;
  notes: string;
}

export interface Stats {
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
}

export interface PhrasalVerb {
  id: string;
  verb: string;
  meaning: string;
  example: string;
  createdDate: string;
}

export interface Exercise {
  id: string;
  sessionId: string;
  type: 'vocabulary' | 'open_cloze' | 'word_formation' | 'key_word_transformation' | 'error_correction';
  question: string;
  answer: string;
  grammarLink?: string;
  createdDate: string;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  sessionId: string;
  userAnswer: string;
  result: 'correct' | 'close' | 'wrong';
  attemptDate: string;
  attemptNumber: number;
}
