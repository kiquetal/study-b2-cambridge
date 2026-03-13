import { atom } from 'nanostores';
import type { StudySession } from './types';

export const sessionsStore = atom<Record<string, StudySession>>({});

const INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(currentDate: string, reviewCount: number): string {
  const date = new Date(currentDate);
  const intervalIndex = Math.min(reviewCount, INTERVALS.length - 1);
  date.setDate(date.getDate() + INTERVALS[intervalIndex]);
  return date.toISOString().split('T')[0];
}

export async function loadSessions() {
  const res = await fetch('/api/sessions');
  const sessions = await res.json();
  const sessionMap = sessions.reduce((acc: Record<string, StudySession>, s: StudySession) => {
    acc[s.id] = s;
    return acc;
  }, {});
  sessionsStore.set(sessionMap);
}

export async function addSession(session: Omit<StudySession, 'id' | 'nextReviewDate' | 'reviewCount'>) {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  const newSession = await res.json();
  sessionsStore.set({ ...sessionsStore.get(), [newSession.id]: newSession });
}

export async function markAsReviewed(id: string) {
  await fetch(`/api/sessions/${id}`, { method: 'PATCH' });
  await loadSessions();
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

