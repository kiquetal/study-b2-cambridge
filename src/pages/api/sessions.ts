import type { APIRoute } from 'astro';
import { getAllSessions, insertSession } from '../../lib/db';
import { getNextReviewDate } from '../../lib/store';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllSessions()), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const id = Date.now().toString();
  const session = {
    ...data,
    id,
    nextReviewDate: getNextReviewDate(data.date, 0),
    reviewCount: 0,
  };
  insertSession(session);
  return new Response(JSON.stringify(session), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
