import type { APIRoute } from 'astro';
import { getSessionById, updateSession, updateSessionMetadata } from '../../../lib/db';
import { getNextReviewDate } from '../../../lib/store';

export const PATCH: APIRoute = async ({ params, request }) => {
  const session = getSessionById(params.id!);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
  }
  
  const data = await request.json();
  
  // Update metadata (topics and source)
  if (data.topics !== undefined || data.source !== undefined) {
    const topics = data.topics || session.topics;
    const source = data.source !== undefined ? data.source : session.source;
    updateSessionMetadata(params.id!, topics, source);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Update review status
  const newReviewCount = session.reviewCount + 1;
  const newReviewDate = getNextReviewDate(new Date().toISOString().split('T')[0], newReviewCount);
  updateSession(params.id!, newReviewDate, newReviewCount);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
