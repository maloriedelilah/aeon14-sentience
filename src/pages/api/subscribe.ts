export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getLeadAdapter, resolveGroups } from '../../lib/leads/factory';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const honeypot = String(form.get('hp_check') ?? '').trim();
  const listId = String(form.get('listId') ?? '').trim() || undefined;
  const groupId = String(form.get('groupId') ?? '').trim() || undefined;

  if (honeypot !== '') {
    console.log('[subscribe] honeypot triggered; dropping request');
    return jsonResponse({ ok: true });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: 'A valid email address is required.' }, 400);
  }

  let adapter;
  try {
    adapter = getLeadAdapter(env, { listId, groupId });
  } catch (err) {
    console.error('[subscribe] provider misconfigured:', err instanceof Error ? err.message : err);
    return jsonResponse({ ok: false, error: 'Newsletter signup is temporarily unavailable.' }, 500);
  }

  try {
    await adapter.subscribe({
      email,
      name: name || undefined,
      groups: resolveGroups({ listId, groupId }),
    });
  } catch (err) {
    console.error(`[subscribe] ${adapter.name} rejected signup:`, err instanceof Error ? err.message : err);
    return jsonResponse({ ok: false, error: 'Could not complete signup — please try again later.' }, 502);
  }

  return jsonResponse({ ok: true });
};
