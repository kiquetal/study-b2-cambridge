import { atom } from 'nanostores';
import type { SessionTemplate, StudyLog } from './types';

export const templatesStore = atom<Record<string, SessionTemplate>>({});
export const logsStore = atom<Record<string, StudyLog>>({});

const INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(currentDate: string, reviewCount: number): string {
  const date = new Date(currentDate);
  const intervalIndex = Math.min(reviewCount, INTERVALS.length - 1);
  date.setDate(date.getDate() + INTERVALS[intervalIndex]);
  return date.toISOString().split('T')[0];
}

// Templates
export async function loadTemplates() {
  const res = await fetch('/api/templates');
  const templates = await res.json();
  const templateMap = templates.reduce((acc: Record<string, SessionTemplate>, t: SessionTemplate) => {
    acc[t.id] = t;
    return acc;
  }, {});
  templatesStore.set(templateMap);
}

export async function addTemplate(template: Omit<SessionTemplate, 'id' | 'createdDate' | 'nextReviewDate' | 'reviewCount'>) {
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  const newTemplate = await res.json();
  templatesStore.set({ ...templatesStore.get(), [newTemplate.id]: newTemplate });
}

export async function markAsReviewed(id: string) {
  await fetch(`/api/templates/${id}`, { method: 'PATCH' });
  await loadTemplates();
}

export function getDueTemplates(): SessionTemplate[] {
  const templates = templatesStore.get();
  const today = new Date().toISOString().split('T')[0];
  return Object.values(templates).filter(t => t.nextReviewDate <= today);
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

