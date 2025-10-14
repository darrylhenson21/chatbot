export const config = {
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    accessCode: process.env.APP_ACCESS_CODE || 'changeme',
    timezone: process.env.TIMEZONE || 'America/Chicago',
  },
  limits: {
    botLimit: parseInt(process.env.BOT_LIMIT || '20'),
    domainsPerBot: parseInt(process.env.DOMAINS_PER_BOT || '10'),
    accountDomainCap: parseInt(process.env.ACCOUNT_DOMAIN_CAP || '50'),
    crawlMaxPages: parseInt(process.env.CRAWL_MAX_PAGES || '10'),
    docMaxPages: parseInt(process.env.DOC_MAX_PAGES || '20'),
    maxSourceSizeMB: parseInt(process.env.MAX_SOURCE_SIZE_MB || '10'),
    rateMsgsPerMin: parseInt(process.env.RATE_MSGS_PER_MIN || '20'),
    rateMsgsPerDay: parseInt(process.env.RATE_MSGS_PER_DAY || '200'),
    costAlertUSD: parseFloat(process.env.COST_ALERT_USD || '10'),
    deleteRawAfterIndexing: process.env.DELETE_RAW_AFTER_INDEXING !== 'false',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    chatModel: process.env.CHAT_MODEL || 'gpt-4o-mini',
    embedModel: process.env.EMBED_MODEL || 'text-embedding-3-small',
  },
  smtp: {
    from: process.env.EMAIL_FROM || 'Bot Builder <no-reply@example.com>',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  admin: {
    emails: (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean),
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    cookieName: 'app_session',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  cron: {
    secret: process.env.CRON_SECRET || 'change-this-cron-secret',
  },
}
