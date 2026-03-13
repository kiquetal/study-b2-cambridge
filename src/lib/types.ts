export type SkillArea = 'Reading' | 'Writing' | 'Listening' | 'Speaking';

export interface SessionTemplate {
  id: string;
  title: string;
  skillArea: SkillArea;
  topic: string;
  source: string;
  createdDate: string;
  nextReviewDate: string;
  reviewCount: number;
}

export interface StudyLog {
  id: string;
  templateId: string;
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
