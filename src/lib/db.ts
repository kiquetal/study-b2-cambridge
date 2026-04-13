import Database from 'better-sqlite3';
import { join } from 'path';
import type { Session, StudyLog } from './types';

const db = new Database(join(process.cwd(), 'study.db'));

// Sessions table
db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  skillArea TEXT NOT NULL,
  topics TEXT NOT NULL,
  source TEXT NOT NULL,
  createdDate TEXT NOT NULL,
  nextReviewDate TEXT NOT NULL,
  reviewCount INTEGER DEFAULT 0,
  pdfPath TEXT,
  notesPath TEXT
)`);

// Migration: add notesPath if missing
const cols = db.prepare("PRAGMA table_info(sessions)").all() as any[];
if (!cols.some((c: any) => c.name === 'notesPath')) {
  db.exec("ALTER TABLE sessions ADD COLUMN notesPath TEXT");
}

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

// Phrasal Verbs table
db.exec(`CREATE TABLE IF NOT EXISTS phrasal_verbs (
  id TEXT PRIMARY KEY,
  verb TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  createdDate TEXT NOT NULL
)`);

// Exercises table
db.exec(`CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  grammarLink TEXT DEFAULT '',
  createdDate TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id)
)`);

// Exercise Attempts table
db.exec(`CREATE TABLE IF NOT EXISTS exercise_attempts (
  id TEXT PRIMARY KEY,
  exerciseId TEXT NOT NULL,
  sessionId TEXT NOT NULL,
  userAnswer TEXT NOT NULL,
  result TEXT NOT NULL,
  attemptDate TEXT NOT NULL,
  attemptNumber INTEGER DEFAULT 1,
  FOREIGN KEY (exerciseId) REFERENCES exercises(id),
  FOREIGN KEY (sessionId) REFERENCES sessions(id)
)`);

// Sessions
function parseTopics(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
}

export function getAllSessions(): Session[] {
  const rows = db.prepare('SELECT * FROM sessions ORDER BY createdDate DESC').all() as any[];
  return rows.map(row => ({
    ...row,
    topics: parseTopics(row.topics)
  }));
}

export function insertSession(session: Session) {
  db.prepare(
    `INSERT INTO sessions (id, title, skillArea, topics, source, createdDate, nextReviewDate, reviewCount, pdfPath, notesPath)
     VALUES (@id, @title, @skillArea, @topics, @source, @createdDate, @nextReviewDate, @reviewCount, @pdfPath, @notesPath)`
  ).run({
    ...session,
    topics: JSON.stringify(session.topics),
    pdfPath: session.pdfPath || null,
    notesPath: session.notesPath || null
  });
}

export function updateSession(id: string, nextReviewDate: string, reviewCount: number) {
  db.prepare('UPDATE sessions SET nextReviewDate = ?, reviewCount = ? WHERE id = ?').run(nextReviewDate, reviewCount, id);
}

export function updateSessionMetadata(id: string, topics: string[], source: string) {
  db.prepare('UPDATE sessions SET topics = ?, source = ? WHERE id = ?').run(JSON.stringify(topics), source, id);
}

export function updateSessionPdf(id: string, pdfPath: string) {
  db.prepare('UPDATE sessions SET pdfPath = ? WHERE id = ?').run(pdfPath, id);
}

export function updateSessionNotes(id: string, notesPath: string | null) {
  db.prepare('UPDATE sessions SET notesPath = ? WHERE id = ?').run(notesPath, id);
}

export function deleteSession(id: string) {
  db.prepare('DELETE FROM study_logs WHERE sessionId = ?').run(id);
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

// Phrasal Verbs
export function getAllPhrasalVerbs() {
  return db.prepare('SELECT * FROM phrasal_verbs ORDER BY createdDate DESC').all();
}

export function insertPhrasalVerb(verb: any) {
  db.prepare(
    `INSERT INTO phrasal_verbs (id, verb, meaning, example, createdDate)
     VALUES (@id, @verb, @meaning, @example, @createdDate)`
  ).run(verb);
}

export function deletePhrasalVerb(id: string) {
  db.prepare('DELETE FROM phrasal_verbs WHERE id = ?').run(id);
}

// Exercises
export function getExercisesBySession(sessionId: string) {
  return db.prepare('SELECT * FROM exercises WHERE sessionId = ? ORDER BY createdDate DESC').all(sessionId);
}

export function insertExercise(exercise: any) {
  db.prepare(
    `INSERT INTO exercises (id, sessionId, type, question, answer, grammarLink, createdDate)
     VALUES (@id, @sessionId, @type, @question, @answer, @grammarLink, @createdDate)`
  ).run(exercise);
}

export function deleteExercisesBySession(sessionId: string) {
  db.prepare('DELETE FROM exercises WHERE sessionId = ?').run(sessionId);
}

export function getSessionById(id: string): Session | undefined {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  return {
    ...row,
    topics: parseTopics(row.topics)
  };
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

// Exercise Attempts
export function getAttemptsBySession(sessionId: string) {
  return db.prepare(
    'SELECT * FROM exercise_attempts WHERE sessionId = ? ORDER BY attemptNumber DESC, attemptDate DESC'
  ).all(sessionId);
}

export function getLatestAttemptsBySession(sessionId: string) {
  return db.prepare(
    `SELECT ea.* FROM exercise_attempts ea
     INNER JOIN (SELECT exerciseId, MAX(attemptNumber) as maxAttempt FROM exercise_attempts WHERE sessionId = ? GROUP BY exerciseId) latest
     ON ea.exerciseId = latest.exerciseId AND ea.attemptNumber = latest.maxAttempt
     WHERE ea.sessionId = ?`
  ).all(sessionId, sessionId);
}

export function insertAttempt(attempt: any) {
  db.prepare(
    `INSERT INTO exercise_attempts (id, exerciseId, sessionId, userAnswer, result, attemptDate, attemptNumber)
     VALUES (@id, @exerciseId, @sessionId, @userAnswer, @result, @attemptDate, @attemptNumber)`
  ).run(attempt);
}

export function resetAttemptsBySession(sessionId: string) {
  return db.prepare('DELETE FROM exercise_attempts WHERE sessionId = ?').run(sessionId);
}

export function getAttemptNumberForExercise(exerciseId: string) {
  const row = db.prepare(
    'SELECT MAX(attemptNumber) as max FROM exercise_attempts WHERE exerciseId = ?'
  ).get(exerciseId) as any;
  return (row?.max || 0) + 1;
}

export function getExerciseStatsBySession(sessionId: string) {
  return db.prepare(
    `SELECT ea.attemptNumber,
            COUNT(*) as total,
            SUM(CASE WHEN ea.result = 'correct' THEN 1 ELSE 0 END) as correct,
            SUM(CASE WHEN ea.result = 'close' THEN 1 ELSE 0 END) as close,
            SUM(CASE WHEN ea.result = 'wrong' THEN 1 ELSE 0 END) as wrong
     FROM exercise_attempts ea
     WHERE ea.sessionId = ?
     GROUP BY ea.attemptNumber
     ORDER BY ea.attemptNumber`
  ).all(sessionId);
}

export function getExerciseStatsByType(sessionId: string) {
  return db.prepare(
    `SELECT e.type,
            COUNT(*) as total,
            SUM(CASE WHEN ea.result = 'correct' THEN 1 ELSE 0 END) as correct,
            SUM(CASE WHEN ea.result = 'wrong' THEN 1 ELSE 0 END) as wrong
     FROM exercise_attempts ea
     JOIN exercises e ON ea.exerciseId = e.id
     INNER JOIN (SELECT exerciseId, MAX(attemptNumber) as maxAttempt FROM exercise_attempts WHERE sessionId = ? GROUP BY exerciseId) latest
       ON ea.exerciseId = latest.exerciseId AND ea.attemptNumber = latest.maxAttempt
     WHERE ea.sessionId = ?
     GROUP BY e.type`
  ).all(sessionId, sessionId);
}

export function getOverallExerciseStats() {
  return db.prepare(
    `SELECT COUNT(DISTINCT ea.sessionId) as sessionsAttempted,
            COUNT(*) as totalAttempts,
            SUM(CASE WHEN ea.result = 'correct' THEN 1 ELSE 0 END) as totalCorrect,
            ROUND(AVG(CASE WHEN ea.result = 'correct' THEN 100.0 ELSE 0 END), 1) as avgAccuracy
     FROM exercise_attempts ea`
  ).get();
}
