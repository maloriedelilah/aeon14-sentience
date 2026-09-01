import type { LeadAdapter, Lead } from './types';

export interface EmailOctopusOptions {
  doubleOptIn?: boolean;
}

export const emailoctopus = (
  apiKey: string,
  listId: string,
  options: EmailOctopusOptions = {},
): LeadAdapter => ({
  name: 'emailoctopus',
  async subscribe(lead: Lead) {
    const res = await fetch(`https://api.emailoctopus.com/lists/${listId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email_address: lead.email,
        fields: lead.name ? { FirstName: lead.name } : undefined,
        tags: lead.groups && lead.groups.length > 0 ? lead.groups : undefined,
        status: options.doubleOptIn === false ? 'SUBSCRIBED' : 'PENDING',
      }),
    });
    if (!res.ok) throw new Error(`EmailOctopus ${res.status}: ${await res.text()}`);
    return { ok: true };
  },
});
