import type { LeadAdapter } from './types';
import { emailoctopus } from './emailoctopus';
import { mailerlite } from './mailerlite';
import { siteConfig } from '../../config';

export interface LeadProviderEnv {
  EMAILOCTOPUS_API_KEY?: string;
  EMAILOCTOPUS_LIST_ID?: string;
  MAILERLITE_API_KEY?: string;
}

export interface LeadTargetOverrides {
  listId?: string;
  groupId?: string;
}

export type LeadProviderFactory = (
  env: LeadProviderEnv & Record<string, string | undefined>,
  overrides: LeadTargetOverrides,
) => LeadAdapter;

const overrideModules = import.meta.glob('/src/overrides/providers/*.ts', {
  eager: true,
}) as Record<string, Record<string, unknown>>;

function findOverrideFactory(providerName: string): LeadProviderFactory | undefined {
  for (const [filePath, mod] of Object.entries(overrideModules)) {
    const baseName = filePath.split('/').pop()?.replace(/\.ts$/, '');
    if (baseName !== providerName) continue;
    const candidate = mod[providerName] ?? mod.default;
    if (typeof candidate === 'function') return candidate as LeadProviderFactory;
  }
  return undefined;
}

export function getLeadAdapter(
  env: LeadProviderEnv & Record<string, string | undefined>,
  overrides: LeadTargetOverrides = {},
): LeadAdapter {
  const providerName = siteConfig.leads.provider;
  const override = findOverrideFactory(providerName);
  if (override) return override(env, overrides);

  switch (providerName) {
    case 'emailoctopus': {
      const apiKey = env.EMAILOCTOPUS_API_KEY;
      if (!apiKey) throw new Error('EMAILOCTOPUS_API_KEY is not set.');
      const listId = overrides.listId ?? env.EMAILOCTOPUS_LIST_ID;
      if (!listId) throw new Error('EMAILOCTOPUS_LIST_ID is not set.');
      return emailoctopus(apiKey, listId, { doubleOptIn: siteConfig.leads.doubleOptIn });
    }
    case 'mailerlite': {
      const apiKey = env.MAILERLITE_API_KEY;
      if (!apiKey) throw new Error('MAILERLITE_API_KEY is not set.');
      return mailerlite(apiKey);
    }
    default:
      throw new Error(`Unknown newsletter provider: ${String(providerName)}`);
  }
}

export function resolveGroups(overrides: LeadTargetOverrides): string[] {
  if (overrides.groupId) return [overrides.groupId];
  return siteConfig.leads.groups ?? [];
}
