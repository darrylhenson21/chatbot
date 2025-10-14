# 🚀 QUICK START GUIDE

## Current Status: ✅ Server is RUNNING on port 3000

## What You Need to Do NOW:

### Step 1: Initialize Database (CRITICAL - Takes 2 minutes)

The database needs to be set up. Here's the SQL schema location:
**File:** `/app/database/schema.sql`

**Two Options:**

#### Option A: Via Supabase Dashboard (EASIEST)
1. Open: https://supabase.com/dashboard/project/rfeklguhprnaindgoygt/sql/new
2. Open the file: `/app/database/schema.sql` 
3. Copy ALL the SQL content
4. Paste into Supabase SQL Editor
5. Click the green **RUN** button

#### Option B: View Schema Content
```bash
cat /app/database/schema.sql
```

This creates:
- ✅ pgvector extension (for AI embeddings)
- ✅ All 15+ tables (accounts, bots, sessions, chunks, domains, leads, messages, etc.)
- ✅ Vector search indexes
- ✅ Default Greymouse AI account

### Step 2: Create Storage Bucket (30 seconds)
1. Go to: https://supabase.com/dashboard/project/rfeklguhprnaindgoygt/storage/buckets
2. Click **"New bucket"**
3. Name: `bot-uploads`
4. Make it **Private** (uncheck public)
5. Click **Create**

### Step 3: Access the App

**Preview URL:** Check the preview panel on the right →

**Or Direct Access:**
- URL: http://localhost:3000
- You'll see the **Unlock Page**
- Enter code: `greymouse2024`
- Dashboard will load with bot management

---

## 🧪 Test Locally (Without Database)

Even without database, you can see the UI:

```bash
# Check if server is running
curl -I http://localhost:3000

# View unlock page HTML
curl http://localhost:3000/unlock | head -50

# Check logs
tail -f /var/log/supervisor/nextjs.out.log
```

---

## 📊 What the SQL Schema Creates

The `/app/database/schema.sql` file sets up:

### Tables Created:
1. **accounts** - User account (Greymouse AI Services)
2. **bots** - Up to 20 chatbots per account
3. **provider_keys** - BYOK (encrypted OpenAI keys)
4. **bot_limits** - Re-index tracking
5. **domains** - Allowlist (up to 10 per bot)
6. **sources** - URL/document sources
7. **chunks** - Text chunks with vector embeddings (1536-dim)
8. **sessions** - Authentication sessions
9. **auth_attempts** - Brute-force tracking
10. **messages** - Chat history
11. **leads** - Captured leads
12. **usage_daily** - Cost tracking
13. **email_events** - Email logs
14. **error_logs** - System errors

### Vector Search:
- Enables pgvector extension
- Creates IVFFlat index for fast similarity search
- Stores OpenAI text-embedding-3-small (1536 dimensions)

---

## 🔧 Troubleshooting

### "Page is blank in preview"
- Make sure you're accessing port 3000
- Check: `supervisorctl status nextjs` (should show RUNNING)
- Restart: `supervisorctl restart nextjs`

### "Database connection errors"
- Run the SQL schema first (Step 1 above)
- Verify credentials in `/app/nextjs-app/.env.local`

### "Can't see unlock page"
- Server might be starting, wait 5 seconds
- Check logs: `tail -f /var/log/supervisor/nextjs.out.log`
- Should see: "Ready in X.Xs"

---

## 📁 Project Structure

```
/app/nextjs-app/              ← Your Next.js app
├── app/                      ← Pages & API routes
│   ├── (dashboard)/bots/    ← Bot management UI
│   ├── api/auth/unlock/     ← Authentication API
│   ├── api/bots/            ← Bot CRUD APIs
│   └── unlock/              ← Access gate page
├── components/               ← React components
├── lib/                      ← Utilities (auth, db, openai, etc.)
├── database/                 
│   └── schema.sql           ← DATABASE SETUP FILE (RUN THIS!)
├── .env.local               ← Your credentials (configured)
└── package.json             ← Dependencies

/app/database/schema.sql      ← **IMPORTANT: Run this in Supabase!**
/app/SETUP_GUIDE.md          ← Detailed setup instructions
```

---

## ✅ What's Already Built

**Working Now:**
- ✅ Next.js 14 server running (port 3000)
- ✅ Unlock page UI
- ✅ Dashboard layout
- ✅ Bots grid page
- ✅ Authentication system
- ✅ API routes for bot management
- ✅ OpenAI integration utilities
- ✅ Document parsers (PDF, DOCX, TXT)
- ✅ URL crawler
- ✅ All dependencies installed

**Needs Database to Work:**
- Creating/editing bots
- Storing data
- User sessions
- Bot configurations

---

## 🎯 NEXT: After Database is Set Up

Once you run the SQL schema, you can:
1. ✅ Create up to 20 bots
2. ✅ Configure bot settings
3. ✅ Manage domains
4. ✅ Track usage

Then we'll build:
- Bot editor (5 tabs)
- RAG pipeline
- Chat API
- Embed widget
- Analytics dashboard

---

**Quick Summary:**
1. 📄 Run `/app/database/schema.sql` in Supabase SQL Editor
2. 📦 Create `bot-uploads` storage bucket
3. 🔓 Access app at http://localhost:3000
4. 🔑 Enter code: `greymouse2024`
5. ✨ Start creating bots!
