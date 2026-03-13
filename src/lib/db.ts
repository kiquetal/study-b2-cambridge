import Database from 'better-sqlite3';
import { join } from 'path';
import type { StudySession } from './types';

const db = new Database(join(process.cwd(), 'study.db'));

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  skillArea TEXT NOT NULL,
  topic TEXT NOT NULL,
  source TEXT NOT NULL,
  notes TEXT DEFAULT '',
  exerciseCount INTEGER DEFAULT 0,
  confidenceLevel INTEGER DEFAULT 3,
  nextReviewDate TEXT NOT NULL,
  reviewCount INTEGER DEFAULT 0
)`);

export function getAllSessions(): StudySession[] {
  return db.prepare('SELECT * FROM sessions ORDER BY date DESC').all() as StudySession[];
}

export function insertSession(session: StudySession) {
  db.prepare(
    `INSERT INTO sessions (id, date, duration, skillArea, topic, source, notes, exerciseCount, confidenceLevel, nextReviewDate, reviewCount)
     VALUES (@id, @date, @duration, @skillArea, @topic, @source, @notes, @exerciseCount, @confidenceLevel, @nextReviewDate, @reviewCount)`
  ).run(session);
}

export function updateSession(id: string, nextReviewDate: string, reviewCount: number) {
  db.prepare('UPDATE sessions SET nextReviewDate = ?, reviewCount = ? WHERE id = ?').run(nextReviewDate, reviewCount, id);
}

export function getSessionById(id: string): StudySession | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as StudySession | undefined;
}
