export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { resend } from '../../lib/email/resend';
import { verifyTurnstile } from '../../lib/turnstile';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const honeypot = String(form.get('hp_check') ?? '').trim();
  const turnstileToken = form.get('cf-turnstile-response');

  if (honeypot !== '') return jsonResponse({ ok: true });
  if (!name || !email || !message) {
    return jsonResponse({ ok: false, error: 'Name, email, and message are required.' }, 400);
  }

  const remoteIp = request.headers.get('CF-Connecting-IP') ?? undefined;
  const turnstileResult = await verifyTurnstile(
    typeof turnstileToken === 'string' ? turnstileToken : null,
    env.TURNSTILE_SECRET_KEY,
    remoteIp,
  );

  if (!turnstileResult.ok) {
    console.warn('[contact] Turnstile rejected submission:', turnstileResult.errorCodes);
    return jsonResponse({ ok: false, error: 'Spam check failed — please try again.' }, 400);
  }

  try {
    await resend(env.RESEND_API_KEY).send({
      to: env.CONTACT_TO_EMAIL,
      from: env.CONTACT_FROM_EMAIL,
      replyTo: email,
      subject: `Sentience Saga contact: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    console.error('[contact] Resend failed:', err instanceof Error ? err.message : err);
    return jsonResponse({ ok: false, error: 'Message could not be sent — please try again later.' }, 502);
  }

  return jsonResponse({ ok: true });
};
