import Database from 'better-sqlite3';
import { join } from 'path';
import type { Session, StudyLog } from './types';

const db = new Database(join(process.cwd(), 'study.db'));

// Sessions table
db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  skillArea TEXT NOT NULL,
  topic TEXT NOT NULL,
  source TEXT NOT NULL,
  createdDate TEXT NOT NULL,
  nextReviewDate TEXT NOT NULL,
  reviewCount INTEGER DEFAULT 0
)`);

// Study Logs table
db.exec(`CREATE TABLE IF NOT EXISTS study_logs (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exerciseCount INTEGER DEFAULT 0,
  confidenceLevel INTEGER DEFAULT 3,
  notes TEXT DEFAULT '',
  FOREIGN KEY (sessionId) REFERENCES sessions(id)
)`);

// Sessions
export function getAllSessions(): Session[] {
  return db.prepare('SELECT * FROM sessions ORDER BY createdDate DESC').all() as Session[];
}

export function insertSession(session: Session) {
  db.prepare(
    `INSERT INTO sessions (id, title, skillArea, topic, source, createdDate, nextReviewDate, reviewCount)
     VALUES (@id, @title, @skillArea, @topic, @source, @createdDate, @nextReviewDate, @reviewCount)`
  ).run(session);
}

export function updateSession(id: string, nextReviewDate: string, reviewCount: number) {
  db.prepare('UPDATE sessions SET nextReviewDate = ?, reviewCount = ? WHERE id = ?').run(nextReviewDate, reviewCount, id);
}

export function getSessionById(id: string): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
}

// Study Logs
export function getAllLogs(): StudyLog[] {
  return db.prepare('SELECT * FROM study_logs ORDER BY date DESC').all() as StudyLog[];
}

export function getLogsBySession(sessionId: string): StudyLog[] {
  return db.prepare('SELECT * FROM study_logs WHERE sessionId = ? ORDER BY date DESC').all(sessionId) as StudyLog[];
}

export function insertLog(log: StudyLog) {
  db.prepare(
    `INSERT INTO study_logs (id, sessionId, date, duration, exerciseCount, confidenceLevel, notes)
     VALUES (@id, @sessionId, @date, @duration, @exerciseCount, @confidenceLevel, @notes)`
  ).run(log);
}
