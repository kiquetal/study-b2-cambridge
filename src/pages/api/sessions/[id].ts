import type { APIRoute } from 'astro';
import { getSessionById, updateSession } from '../../../lib/db';
import { getNextReviewDate } from '../../../lib/store';

export const PATCH: APIRoute = async ({ params }) => {
  const session = getSessionById(params.id!);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
  }
  const newReviewCount = session.reviewCount + 1;
  const newReviewDate = getNextReviewDate(new Date().toISOString().split('T')[0], newReviewCount);
  updateSession(params.id!, newReviewDate, newReviewCount);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
