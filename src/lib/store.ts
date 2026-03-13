import { atom } from 'nanostores';
import type { Session, StudyLog } from './types';

export const sessionsStore = atom<Record<string, Session>>({});
export const logsStore = atom<Record<string, StudyLog>>({});

const INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(currentDate: string, reviewCount: number): string {
  const date = new Date(currentDate);
  const intervalIndex = Math.min(reviewCount, INTERVALS.length - 1);
  date.setDate(date.getDate() + INTERVALS[intervalIndex]);
  return date.toISOString().split('T')[0];
}

// Sessions
export async function loadSessions() {
  const res = await fetch('/api/sessions');
  const sessions = await res.json();
  const sessionMap = sessions.reduce((acc: Record<string, Session>, s: Session) => {
    acc[s.id] = s;
    return acc;
  }, {});
  sessionsStore.set(sessionMap);
}

export async function addSession(session: Omit<Session, 'id' | 'createdDate' | 'nextReviewDate' | 'reviewCount'>) {
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

export function getDueSessions(): Session[] {
  const sessions = sessionsStore.get();
  const today = new Date().toISOString().split('T')[0];
  return Object.values(sessions).filter(s => s.nextReviewDate <= today);
}

// Study Logs
export async function loadLogs() {
  const res = await fetch('/api/logs');
  const logs = await res.json();
  const logMap = logs.reduce((acc: Record<string, StudyLog>, l: StudyLog) => {
    acc[l.id] = l;
    return acc;
  }, {});
  logsStore.set(logMap);
}

export async function addLog(log: Omit<StudyLog, 'id'>) {
  const res = await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  const newLog = await res.json();
  logsStore.set({ ...logsStore.get(), [newLog.id]: newLog });
}

export function getStats() {
  const logs = Object.values(logsStore.get());
  const totalSessions = logs.length;
  const totalHours = logs.reduce((sum, l) => sum + l.duration, 0) / 60;
  
  const dates = logs.map(l => l.date).sort();
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

