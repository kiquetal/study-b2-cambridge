import type { APIRoute } from 'astro';
import { getAllSessions, insertSession, deleteSession } from '../../lib/db';
import { getNextReviewDate } from '../../lib/store';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllSessions()), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const id = Date.now().toString();
  const createdDate = new Date().toISOString();
  const session = {
    ...data,
    id,
    createdDate,
    nextReviewDate: getNextReviewDate(createdDate.split('T')[0], 0),
    reviewCount: 0,
  };
  insertSession(session);
  return new Response(JSON.stringify(session), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  deleteSession(id);
  return new Response(null, { status: 204 });
};
