import type { APIRoute } from 'astro';
import { getTemplateById, updateTemplate } from '../../../lib/db';
import { getNextReviewDate } from '../../../lib/store';

export const PATCH: APIRoute = async ({ params }) => {
  const template = getTemplateById(params.id!);
  if (!template) {
    return new Response(JSON.stringify({ error: 'Template not found' }), { status: 404 });
  }
  const newReviewCount = template.reviewCount + 1;
  const newReviewDate = getNextReviewDate(new Date().toISOString().split('T')[0], newReviewCount);
  updateTemplate(params.id!, newReviewDate, newReviewCount);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
