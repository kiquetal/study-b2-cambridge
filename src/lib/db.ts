import Database from 'better-sqlite3';
import { join } from 'path';
import type { SessionTemplate, StudyLog } from './types';

const db = new Database(join(process.cwd(), 'study.db'));

// Session Templates table
db.exec(`CREATE TABLE IF NOT EXISTS session_templates (
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
  templateId TEXT NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exerciseCount INTEGER DEFAULT 0,
  confidenceLevel INTEGER DEFAULT 3,
  notes TEXT DEFAULT '',
  FOREIGN KEY (templateId) REFERENCES session_templates(id)
)`);

// Session Templates
export function getAllTemplates(): SessionTemplate[] {
  return db.prepare('SELECT * FROM session_templates ORDER BY createdDate DESC').all() as SessionTemplate[];
}

export function insertTemplate(template: SessionTemplate) {
  db.prepare(
    `INSERT INTO session_templates (id, title, skillArea, topic, source, createdDate, nextReviewDate, reviewCount)
     VALUES (@id, @title, @skillArea, @topic, @source, @createdDate, @nextReviewDate, @reviewCount)`
  ).run(template);
}

export function updateTemplate(id: string, nextReviewDate: string, reviewCount: number) {
  db.prepare('UPDATE session_templates SET nextReviewDate = ?, reviewCount = ? WHERE id = ?').run(nextReviewDate, reviewCount, id);
}

export function getTemplateById(id: string): SessionTemplate | undefined {
  return db.prepare('SELECT * FROM session_templates WHERE id = ?').get(id) as SessionTemplate | undefined;
}

// Study Logs
export function getAllLogs(): StudyLog[] {
  return db.prepare('SELECT * FROM study_logs ORDER BY date DESC').all() as StudyLog[];
}

export function getLogsByTemplate(templateId: string): StudyLog[] {
  return db.prepare('SELECT * FROM study_logs WHERE templateId = ? ORDER BY date DESC').all(templateId) as StudyLog[];
}

export function insertLog(log: StudyLog) {
  db.prepare(
    `INSERT INTO study_logs (id, templateId, date, duration, exerciseCount, confidenceLevel, notes)
     VALUES (@id, @templateId, @date, @duration, @exerciseCount, @confidenceLevel, @notes)`
  ).run(log);
}
