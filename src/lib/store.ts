import { persistentMap } from '@nanostores/persistent';
import type { StudySession } from './types';

export const sessionsStore = persistentMap<Record<string, StudySession>>('sessions:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

const INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(currentDate: string, reviewCount: number): string {
  const date = new Date(currentDate);
  const intervalIndex = Math.min(reviewCount, INTERVALS.length - 1);
  date.setDate(date.getDate() + INTERVALS[intervalIndex]);
  return date.toISOString().split('T')[0];
}

export function addSession(session: Omit<StudySession, 'id' | 'nextReviewDate' | 'reviewCount'>) {
  const id = Date.now().toString();
  const nextReviewDate = getNextReviewDate(session.date, 0);
  const newSession: StudySession = { ...session, id, nextReviewDate, reviewCount: 0 };
  sessionsStore.setKey(id, newSession);
}

export function markAsReviewed(id: string) {
  const sessions = sessionsStore.get();
  const session = sessions[id];
  if (session) {
    const updatedSession = {
      ...session,
      reviewCount: session.reviewCount + 1,
      nextReviewDate: getNextReviewDate(new Date().toISOString().split('T')[0], session.reviewCount + 1),
    };
    sessionsStore.setKey(id, updatedSession);
  }
}

export function getDueSessions(): StudySession[] {
  const sessions = sessionsStore.get();
  const today = new Date().toISOString().split('T')[0];
  return Object.values(sessions).filter(s => s.nextReviewDate <= today);
}

export function getStats() {
  const sessions = Object.values(sessionsStore.get());
  const totalSessions = sessions.length;
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  
  const dates = sessions.map(s => s.date).sort();
  let streak = 0;
  if (dates.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    const dateSet = new Set(dates);
    
    while (dateSet.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }
  
  return { totalSessions, totalHours: Math.round(totalHours * 10) / 10, currentStreak: streak };
}
