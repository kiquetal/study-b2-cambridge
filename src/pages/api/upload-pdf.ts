import type { APIRoute } from 'astro';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { updateSessionPdf, getSessionById } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('pdf') as File;
  const sessionId = formData.get('sessionId') as string;

  if (!file || !sessionId) {
    return new Response(JSON.stringify({ error: 'Missing file or sessionId' }), { status: 400 });
  }

  const uploadsDir = join(process.cwd(), 'public', 'pdfs');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${sessionId}-${Date.now()}.pdf`;
  const filepath = join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const pdfPath = `/pdfs/${filename}`;
  updateSessionPdf(sessionId, pdfPath);

  return new Response(JSON.stringify({ pdfPath }), { status: 200 });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { sessionId } = await request.json();
  const session = getSessionById(sessionId);
  if (session?.pdfPath) {
    try { await unlink(join(process.cwd(), 'public', session.pdfPath)); } catch {}
  }
  updateSessionPdf(sessionId, null as any);
  return new Response(null, { status: 204 });
};
