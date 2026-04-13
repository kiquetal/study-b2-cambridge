import type { APIRoute } from 'astro';
import { readdirSync } from 'fs';
import { join } from 'path';
import { updateSessionNotes } from '../../lib/db';

export const GET: APIRoute = () => {
  const dir = join(process.cwd(), 'rumbling-notes');
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    return new Response(JSON.stringify(files), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const { sessionId, notesPath } = await request.json();
  updateSessionNotes(sessionId, notesPath || null);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
