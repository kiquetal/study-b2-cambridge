import type { APIRoute } from 'astro';
import { getLatestAttemptsBySession, insertAttempt, resetAttemptsBySession, getAttemptNumberForExercise } from '../../lib/db';

export const GET: APIRoute = ({ url }) => {
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify(getLatestAttemptsBySession(sessionId)), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const { exerciseId, sessionId, userAnswer, result } = await request.json();
  const attemptNumber = getAttemptNumberForExercise(exerciseId);
  const attempt = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    exerciseId, sessionId, userAnswer, result,
    attemptDate: new Date().toISOString(),
    attemptNumber,
  };
  insertAttempt(attempt);
  return new Response(JSON.stringify(attempt), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { sessionId } = await request.json();
  resetAttemptsBySession(sessionId);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
