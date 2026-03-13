import type { APIRoute } from 'astro';
import { getAllTemplates, insertTemplate } from '../../lib/db';
import { getNextReviewDate } from '../../lib/store';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllTemplates()), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const id = Date.now().toString();
  const createdDate = new Date().toISOString().split('T')[0];
  const template = {
    ...data,
    id,
    createdDate,
    nextReviewDate: getNextReviewDate(createdDate, 0),
    reviewCount: 0,
  };
  insertTemplate(template);
  return new Response(JSON.stringify(template), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
