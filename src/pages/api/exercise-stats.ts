import type { APIRoute } from 'astro';
import { getExerciseStatsBySession, getExerciseStatsByType, getOverallExerciseStats } from '../../lib/db';

export const GET: APIRoute = ({ url }) => {
  const sessionId = url.searchParams.get('sessionId');
  if (sessionId) {
    return new Response(JSON.stringify({
      byAttempt: getExerciseStatsBySession(sessionId),
      byType: getExerciseStatsByType(sessionId),
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(getOverallExerciseStats()), { headers: { 'Content-Type': 'application/json' } });
};
