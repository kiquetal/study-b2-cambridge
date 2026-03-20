import type { APIRoute } from 'astro';
import { getExercisesBySession, insertExercise, deleteExercisesBySession } from '../../lib/db';

export const GET: APIRoute = ({ url }) => {
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify(getExercisesBySession(sessionId)), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const { exercises } = await request.json();
  for (const ex of exercises) {
    insertExercise({ ...ex, id: ex.id || Date.now().toString() + Math.random().toString(36).slice(2, 6) });
  }
  return new Response(JSON.stringify({ success: true, count: exercises.length }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { sessionId } = await request.json();
  deleteExercisesBySession(sessionId);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
