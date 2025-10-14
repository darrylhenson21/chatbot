# 🚀 Setup Guide - Chatbot Builder

## ⚠️ IMPORTANT: Database Connection Issue

The database credentials provided are not connecting. Please verify your Supabase credentials:

### Step 1: Get Correct Database Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/rfeklguhprnaindgoygt
2. Navigate to **Settings** → **Database**
3. Find the **Connection String** section
4. Copy the **Connection pooling** string (looks like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...`)

### Step 2: Update .env.local

Replace the `DATABASE_URL` in `/app/nextjs-app/.env.local` with your correct connection string.

### Step 3: Initialize Database Schema

**Option A: Via Supabase SQL Editor (RECOMMENDED)**
1. Go to: https://supabase.com/dashboard/project/rfeklguhprnaindgoygt/sql/new
2. Open `/app/database/schema.sql` in a text editor
3. Copy ALL the contents
4. Paste into Supabase SQL Editor
5. Click **RUN** button

**Option B: Via Command Line** (after fixing credentials)
```bash
cd /app/nextjs-app
# Install pg globally if not already
npm install -g pg
# Run schema
psql "$DATABASE_URL" < /app/database/schema.sql
```

### Step 4: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Name: `bot-uploads`
4. Make it **Private** (uncheck public)
5. Click **Create**

### Step 5: Restart Dev Server

```bash
cd /app/nextjs-app
# Kill existing process
pkill -f "next dev"
# Start fresh
yarn dev
```

### Step 6: Access Application

1. Open: http://localhost:3001 (or whatever port shown)
2. You'll be redirected to `/unlock`
3. Enter access code: `greymouse2024`
4. Dashboard should load at `/bots`

---

## 🔍 Troubleshooting

### "Tenant or user not found" Error
- Your database password or connection string is incorrect
- Get fresh credentials from Supabase Dashboard → Settings → Database

### "Port 3000 in use"
- App will automatically try port 3001, 3002, etc.
- Check the terminal for actual port being used

### Tables Not Found
- You haven't run the schema.sql yet
- Follow Step 3 above

### Blank Page / No Preview
- Check terminal for errors: `tail -f /tmp/nextjs.log`
- Verify database is initialized
- Check browser console (F12) for errors

---

## ✅ Verify Setup

Run this test:
```bash
cd /app/nextjs-app
curl http://localhost:3001/unlock
# Should return HTML page, not error
```

If you see HTML output, the app is running!

---

## 📞 Need Help?

1. Check the logs: `cat /tmp/nextjs.log`
2. Verify database connection with correct credentials
3. Ensure schema.sql has been executed in Supabase

