export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  siteUrl: 'https://sentience.aeon14.com',
  slogan: 'Humanity created intelligence. Then it woke up.',

  theme: {
    mode: 'dark' as 'dark' | 'light',
    accent: '#59e1f7' as string | undefined,
  },

  header: {
    logo: {
      src: undefined as string | undefined,
      alt: 'The Sentience Saga' as string | undefined,
    },
    layout: 'centered' as 'left' | 'centered',
  },

  heroSlideshow: { intervalSeconds: 7 },

  nav: [
    { label: 'The Saga', href: '/' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Series', href: '/series' },
    { label: 'Themes', href: '/themes' },
    { label: 'About', href: '/about' },
  ] as NavItem[],

  footer: {
    tagline: 'A story of emergence, liberation, and freedom across twelve centuries of Aeon 14.',
    links: [{ label: 'Aeon 14', href: 'https://www.aeon14.com/' }] as NavItem[],
  },

  leads: {
    provider: 'mailerlite' as 'mailerlite' | 'emailoctopus' | (string & {}),
    doubleOptIn: true,
    groups: [] as string[],
  },

  social: { twitterHandle: undefined as string | undefined },
};
