import type { APIRoute } from 'astro';
import { getAllPhrasalVerbs, insertPhrasalVerb, deletePhrasalVerb } from '../../lib/db';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllPhrasalVerbs()), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const verb = {
    id: Date.now().toString(),
    ...data,
    createdDate: new Date().toISOString()
  };
  insertPhrasalVerb(verb);
  return new Response(JSON.stringify(verb), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  deletePhrasalVerb(id);
  return new Response(null, { status: 204 });
};
