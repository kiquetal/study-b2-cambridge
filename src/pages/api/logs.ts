import type { APIRoute } from 'astro';
import { getAllLogs, insertLog } from '../../lib/db';

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
