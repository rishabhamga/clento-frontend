export const siteConfig = {
  name: 'Clento Clay',
  description: 'AI-Powered LinkedIn and Email Outreach Automation Platform',
  url: 'https://clento.clay',
  ogImage: 'https://clento.clay/og.jpg',
  links: {
    twitter: 'https://twitter.com/clentoclay',
    github: 'https://github.com/clento/clay',
    docs: 'https://docs.clento.clay',
    support: 'https://support.clento.clay',
  },
  creator: {
    name: 'Clento Team',
    twitter: '@clentoclay',
  },
  keywords: [
    'LinkedIn automation',
    'Email outreach',
    'Sales automation',
    'Lead generation',
    'AI-powered outreach',
    'B2B sales',
    'Cold outreach',
    'Sales development',
  ],
}

export type SiteConfig = typeof siteConfig

// Navigation configuration
export const navigationConfig = {
  mainNav: [
    {
      title: 'Dashboard',
      href: '/',
    },
    {
      title: 'Campaigns',
      href: '/campaigns',
    },
    {
      title: 'Leads',
      href: '/leads',
    },
    {
      title: 'Accounts',
      href: '/accounts',
    },
  ],
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/',
      icon: 'dashboard',
    },
    {
      title: 'Campaigns',
      href: '/campaigns',
      icon: 'target',
    },
    {
      title: 'Leads',
      href: '/leads',
      icon: 'users',
    },
    {
      title: 'Prospect Lists',
      href: '/prospect-lists',
      icon: 'list',
    },
    {
      title: 'Accounts',
      href: '/accounts',
      icon: 'user',
    },
    {
      title: 'Integrations',
      href: '/integrations',
      icon: 'plug',
    },
  ],
  footerNav: [
    {
      title: 'Subscriptions',
      href: '/subscriptions',
      icon: 'credit-card',
    },
    {
      title: 'Support',
      href: '/support',
      icon: 'help-circle',
    },
    {
      title: 'Tutorial',
      href: '/tutorial',
      icon: 'book-open',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'settings',
    },
  ],
}

// API configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
}

// Clerk configuration (hardcoded for simplified deployment)
export const clerkConfig = {
  publishableKey: 'pk_test_YmVjb21pbmctbW9zcXVpdG8tODMuY2xlcmsuYWNjb3VudHMuZGV2JA',
  secretKey: process.env.CLERK_SECRET_KEY, // This is server-side only, so runtime env var is fine
}

// Feature flags
export const featureFlags = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  enableWorkflowBuilder: true,
  enableAdvancedFilters: true,
  enableBulkActions: true,
}
