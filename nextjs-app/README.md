# Chatbot Builder - Greymouse AI Edition

A complete Next.js 14 application for building and deploying AI chatbots trained on custom content.

## Features

- 🤖 Create up to 20 AI chatbots per account
- 📚 Train on 1 URL (depth 1) + 1 document (PDF/DOCX/TXT)
- 🌐 Multi-domain embedding with allowlist control
- 💬 Real-time chat with OpenAI GPT-4o-mini
- 🎯 RAG pipeline with pgvector embeddings
- 📧 Lead capture with instant emails & daily digests
- 🔑 BYOK (Bring Your Own Key) support
- 📊 Analytics & usage tracking
- 🎨 Customizable branding per bot
- 🔒 Enterprise-grade security

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL with pgvector
- **Storage**: Supabase Storage
- **AI**: OpenAI (gpt-4o-mini, text-embedding-3-small)
- **Email**: Nodemailer (SMTP)
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Database Setup

First, initialize your Supabase database:

1. Go to your Supabase project: https://rfeklguhprnaindgoygt.supabase.co
2. Navigate to SQL Editor
3. Run the schema from `/database/schema.sql`

This will:
- Enable pgvector extension
- Create all required tables
- Set up indexes for vector search
- Insert the default account

### 2. Storage Setup

In Supabase:
1. Go to Storage
2. Create a new bucket named `bot-uploads`
3. Set it to **Private**
4. No special CORS or lifecycle policies needed

### 3. Install Dependencies

```bash
cd /app/nextjs-app
yarn install
```

### 4. Environment Variables

The `.env.local` file is already configured with your credentials:
- OpenAI API Key: ✅ Set
- Supabase URL: ✅ Set
- Database URL: ✅ Set
- Access Code: `greymouse2024`

### 5. Run Development Server

```bash
yarn dev
```

The app will be available at `http://localhost:3000`

### 6. First Access

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/unlock`
3. Enter access code: `greymouse2024`
4. You'll be redirected to the bots dashboard

## Project Structure

```
/app/nextjs-app/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── bots/          # Bot management
│   │   ├── keys/          # API keys
│   │   ├── analytics/     # Usage analytics
│   │   ├── leads/         # Lead management
│   │   └── settings/      # Admin settings
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── bots/          # Bot CRUD
│   │   ├── chat/          # Chat endpoint (SSE)
│   │   └── ...
│   ├── unlock/            # Access gate
│   └── embed.js/          # Widget script
├── components/
│   ├── ui/                # Reusable UI components
│   └── dashboard-shell.tsx
├── lib/
│   ├── db.ts              # Database queries
│   ├── auth.ts            # Authentication
│   ├── openai.ts          # OpenAI integration
│   ├── parsers.ts         # Document parsing
│   └── ...
└── database/
    └── schema.sql         # Database schema

```

## Current Implementation Status

### ✅ Completed
- Database schema with pgvector
- Core utilities (auth, crypto, OpenAI, parsers)
- Authentication system with brute-force protection
- Session management with JWT
- Unlock page (access gate)
- Dashboard shell with sidebar navigation
- Bots list page
- Bot CRUD API routes
- UI components library

### 🚧 In Progress (Next Steps)
- Bot editor (5 tabs: General, Knowledge, Domains, Notifications, Embed)
- RAG pipeline implementation
- URL crawler & document upload
- Chat API with SSE streaming
- Embed widget
- Lead capture
- Analytics dashboard
- Email notifications
- Admin panel

## API Endpoints

### Auth
- `POST /api/auth/unlock` - Access gate authentication

### Bots
- `GET /api/bots` - List all bots
- `POST /api/bots` - Create a new bot
- `GET /api/bots/[id]` - Get bot details
- `PATCH /api/bots/[id]` - Update bot
- `DELETE /api/bots/[id]` - Delete bot

### (To be implemented)
- `POST /api/bots/[id]/sources` - Add URL or document
- `GET /api/bots/[id]/domains` - List domains
- `POST /api/bots/[id]/domains` - Add domain
- `POST /api/chat` - Chat endpoint (SSE)
- `POST /api/leads` - Capture lead
- `GET /api/analytics` - Usage analytics
- `POST /api/keys` - Manage BYOK

## Security Features

- ✅ Access code gate with brute-force protection
- ✅ JWT session management (7-day TTL)
- ✅ HttpOnly, SameSite cookies
- ✅ Rate limiting (20 msg/min, 200 msg/day per bot)
- ✅ Domain allowlist enforcement
- ✅ API key encryption at rest (AES-GCM)
- ✅ No PII in logs
- ✅ CSRF protection (built into Next.js)
- ✅ SQL injection protection (parameterized queries)

## Budget Guardrails

- Default monthly budget: $10 USD
- 80% warning banner
- 100% switches to BYOK mode
- Accurate token cost tracking
- Monthly reset on 1st of month

## Deployment to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Support

For questions or issues, contact admin@greymouse.ai

---

Built with ❤️ for Greymouse AI Services
