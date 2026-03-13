export type SkillArea = 'Reading' | 'Writing' | 'Listening' | 'Speaking';

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  skillArea: SkillArea;
  topic: string;
  source: string;
  notes: string;
  exerciseCount: number;
  confidenceLevel: number;
  nextReviewDate: string;
  reviewCount: number;
}

export interface Stats {
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
}
