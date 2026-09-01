/// <reference types="astro/client" />

interface WorkerEnv {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
  EMAILOCTOPUS_API_KEY?: string;
  EMAILOCTOPUS_LIST_ID?: string;
  MAILERLITE_API_KEY?: string;
}

declare module 'cloudflare:workers' {
  export const env: WorkerEnv;
}

interface ImportMetaEnv {
  readonly TURNSTILE_SITE_KEY: string;
}
