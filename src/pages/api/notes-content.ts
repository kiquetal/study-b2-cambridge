import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: APIRoute = ({ url }) => {
  const file = url.searchParams.get('file');
  if (!file) return new Response(JSON.stringify({ error: 'Missing file param' }), { status: 400 });

  try {
    const content = readFileSync(join(process.cwd(), 'rumbling-notes', file), 'utf-8');
    return new Response(JSON.stringify({ file, content }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
  }
};
