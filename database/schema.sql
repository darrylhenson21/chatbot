-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Accounts table (single account for Greymouse AI Services)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_budget_usd DECIMAL(10,2) DEFAULT 10.00,
  current_month_spend DECIMAL(10,2) DEFAULT 0.00,
  budget_reset_date DATE DEFAULT DATE_TRUNC('month', NOW())
);

-- Provider keys (BYOK)
CREATE TABLE IF NOT EXISTS provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai'
  encrypted_key TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, provider)
);

-- Bots table
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  greeting TEXT DEFAULT 'Hi! How can I help you today?',
  system_prompt TEXT DEFAULT 'You are a helpful assistant.',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2) DEFAULT 1.0,
  max_tokens INTEGER DEFAULT 512,
  primary_color TEXT DEFAULT '#0ea5e9',
  text_color TEXT DEFAULT '#ffffff',
  background_color TEXT DEFAULT '#1e293b',
  status TEXT DEFAULT 'needs_source', -- 'needs_source', 'ready', 'processing', 'partial', 'error', 'disabled'
  lead_fields JSONB DEFAULT '{"name":true,"email":true,"phone":true,"business":true,"city":true,"notes":true}',
  require_email BOOLEAN DEFAULT TRUE,
  instant_lead_email BOOLEAN DEFAULT FALSE,
  lead_email_recipients TEXT[], -- comma-separated emails
  daily_digest_enabled BOOLEAN DEFAULT FALSE,
  daily_digest_time TEXT DEFAULT '18:00',
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_events TEXT[], -- ['lead_captured', 'daily_digest']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot limits tracking
CREATE TABLE IF NOT EXISTS bot_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  reindex_count INTEGER DEFAULT 0,
  last_reindex_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bot_id)
);

-- Domains allowlist
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  allow_subdomains BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bot_id, domain)
);

-- Sources (URL or Document)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'url' or 'document'
  url TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size_mb DECIMAL(10,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'partial', 'error'
  pages_total INTEGER,
  pages_indexed INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks with embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS chunks_bot_id_idx ON chunks(bot_id);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brute force tracking
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address)
);

-- Messages (chat history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  domain TEXT,
  page_url TEXT,
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_usd DECIMAL(10,6),
  csat INTEGER, -- 1 for thumbs up, -1 for thumbs down
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_bot_id_idx ON messages(bot_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  domain TEXT,
  page_url TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  business TEXT,
  city TEXT,
  notes TEXT,
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_bot_id_idx ON leads(bot_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);

-- Usage tracking (daily aggregates)
CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  conversations INTEGER DEFAULT 0,
  messages INTEGER DEFAULT 0,
  leads_captured INTEGER DEFAULT 0,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, bot_id, date)
);

CREATE INDEX IF NOT EXISTS usage_daily_date_idx ON usage_daily(date);
CREATE INDEX IF NOT EXISTS usage_daily_bot_id_idx ON usage_daily(bot_id);

-- Email events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'instant_lead', 'daily_digest', 'test_lead', 'test_digest'
  recipient TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at DESC);

-- Insert default account (Greymouse AI Services)
INSERT INTO accounts (name, email) 
VALUES ('Greymouse AI Services', 'admin@greymouse.ai')
ON CONFLICT (email) DO NOTHING;
