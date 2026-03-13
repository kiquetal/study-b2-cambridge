import type { APIRoute } from 'astro';
import { getAllLogs, insertLog } from '../../lib/db';
import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'study.db'));

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllLogs()), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const id = Date.now().toString();
  const log = { ...data, id };
  insertLog(log);
  return new Response(JSON.stringify(log), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const PATCH: APIRoute = async ({ request }) => {
  const data = await request.json();
  db.prepare(
    `UPDATE study_logs SET duration = ?, exerciseCount = ?, confidenceLevel = ?, notes = ? WHERE id = ?`
  ).run(data.duration, data.exerciseCount, data.confidenceLevel, data.notes, data.id);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  db.prepare('DELETE FROM study_logs WHERE id = ?').run(id);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
