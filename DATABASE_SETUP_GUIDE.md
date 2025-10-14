# 🗄️ COMPLETE DATABASE SETUP GUIDE
## For Someone New to Supabase

Follow these exact steps to get your chatbot builder working!

---

## STEP 1: Get the Database Schema (SQL Code)

First, we need to get the SQL code that creates all the database tables.

### On Your Computer:

**Option A: View in Terminal**
```bash
cat /app/database/schema.sql
```
This will show you a lot of SQL code. You need to copy ALL of it.

**Option B: I'll show you the file location**
The file is at: `/app/database/schema.sql`

Let me show you what's in it (first part):

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ...
```

**What to do:**
1. Run: `cat /app/database/schema.sql`
2. Select ALL the output (it's about 200 lines)
3. Copy it (Ctrl+C or Cmd+C)
4. Keep it ready for Step 2

---

## STEP 2: Open Supabase SQL Editor

### Go to Supabase Dashboard:

1. **Open this link in your browser:**
   ```
   https://supabase.com/dashboard/project/rfeklguhprnaindgoygt
   ```

2. **You should see your project dashboard**
   - If you're not logged in, log in first
   - You should see "rfeklguhprnaindgoygt" as your project name

3. **Find the SQL Editor:**
   - Look on the LEFT sidebar
   - Click on the icon that looks like `</>` or says "SQL Editor"
   - OR click "SQL" in the menu

4. **Start a New Query:**
   - Click the "+ New Query" button (usually top right)
   - OR look for "New Query" option
   - You should see a blank text editor

---

## STEP 3: Paste and Run the Schema

### In the SQL Editor:

1. **Paste Your SQL Code:**
   - Click in the empty SQL editor area
   - Paste ALL the code you copied from Step 1
   - Make sure you got everything (should be ~200 lines)

2. **Run the SQL:**
   - Look for a "RUN" button (usually green, top right)
   - OR press `Ctrl+Enter` (Windows) or `Cmd+Enter` (Mac)
   - Click RUN

3. **Wait for Completion:**
   - You should see a "Success" message
   - OR see results like "Query executed successfully"
   - This might take 5-10 seconds

4. **What This Does:**
   - Creates 15 tables (accounts, bots, sessions, etc.)
   - Enables pgvector extension (for AI)
   - Creates indexes for fast searches
   - Inserts your default account

### ✅ Success Looks Like:
- Green checkmark or "Success" message
- No red errors
- Query completes without problems

### ❌ If You See Errors:
- **"extension vector does not exist"** - That's OK, keep going
- **"permission denied"** - Make sure you're using the service role key
- **Other errors** - Send me the exact error message

---

## STEP 4: Create Storage Bucket

Now we need a place to store uploaded documents (PDFs, DOCX files).

### In Supabase Dashboard:

1. **Go to Storage:**
   - Look on the LEFT sidebar again
   - Click on "Storage" (icon looks like a folder/database)
   - You should see "Buckets" section

2. **Create New Bucket:**
   - Click "+ New Bucket" button (top right)
   - OR click "Create a new bucket"

3. **Configure the Bucket:**
   - **Name:** Type exactly: `bot-uploads`
   - **Public:** Make sure this is UNCHECKED (❌ not public)
   - **Private:** Should be checked (✅ yes)
   - Click "Create Bucket" or "Save"

4. **Verify:**
   - You should now see "bot-uploads" in your buckets list
   - It should show as "Private"

### ✅ Success Looks Like:
- "bot-uploads" appears in your storage buckets
- Shows as "Private" or has a lock icon
- No errors

---

## STEP 5: Verify Database Is Working

Let's make sure everything was created correctly!

### Back in SQL Editor:

1. **Run This Test Query:**
   ```sql
   SELECT * FROM accounts;
   ```

2. **Click RUN**

3. **You Should See:**
   - A table with 1 row
   - Email: `admin@greymouse.ai`
   - Name: `Greymouse AI Services`

### ✅ If You See This:
**Congratulations! Database is set up correctly!**

### ❌ If You See "relation accounts does not exist":
- The schema didn't run properly
- Go back to Step 3 and try again
- Make sure you copied ALL the SQL code

---

## STEP 6: Test the App!

Now your database is ready. Let's test it!

### Test the Login:

1. **Open the app in your browser:**
   ```
   http://localhost:3000
   ```

2. **You should see:** "Welcome to your Chatbot Builder"

3. **Enter the access code:**
   ```
   greymouse2024
   ```

4. **Click "Unlock"**

5. **You should now see:**
   - A dashboard with sidebar
   - "Your Bots" heading
   - "Create Bot" button
   - Message: "Let's build your first bot"

### ✅ Success! You Can Now:
- Click "Create Bot"
- Give it a name
- Start building your chatbot!

---

## 🆘 TROUBLESHOOTING

### Problem: "Connection error. Please try again"
**Solution:**
- Check if you ran the schema.sql (Step 3)
- Verify the accounts table exists (Step 5)
- Make sure you're connected to internet

### Problem: "Database not initialized"
**Solution:**
- Go back to Step 3
- Make sure you pasted ALL the SQL code
- Run it again if needed

### Problem: Can't find SQL Editor in Supabase
**Solution:**
1. Go to: https://supabase.com/dashboard/project/rfeklguhprnaindgoygt
2. Look for these icons on the left:
   - Table Editor (looks like a table)
   - SQL Editor (looks like `</>`)
   - Click SQL Editor

### Problem: Storage bucket already exists
**Solution:**
- That's fine! It means it was created before
- Just verify it's named `bot-uploads` and is Private
- You can continue to Step 5

### Problem: "permission denied" when running SQL
**Solution:**
- Make sure you're logged into Supabase
- Try running just one CREATE TABLE statement first
- If still fails, your account might not have permissions

---

## 📋 QUICK CHECKLIST

Before you're done, verify:

- [ ] Ran schema.sql in Supabase SQL Editor
- [ ] Saw "Success" message (no red errors)
- [ ] Created `bot-uploads` storage bucket (private)
- [ ] Tested with `SELECT * FROM accounts;` - saw 1 row
- [ ] Logged into app with `greymouse2024`
- [ ] Can see dashboard with "Create Bot" button

---

## 🎯 SUMMARY

**What You Did:**
1. Copied SQL code from `/app/database/schema.sql`
2. Opened Supabase SQL Editor
3. Pasted and ran the code
4. Created a private storage bucket named `bot-uploads`
5. Verified with a test query
6. Logged into the app

**What This Created:**
- 15 database tables for your chatbot system
- AI vector search capability (pgvector)
- Your admin account (Greymouse AI Services)
- Secure storage for uploaded documents

**Now You Can:**
- Create up to 20 chatbots
- Train them with documents and websites
- Embed them on client websites
- Capture leads
- Track usage

---

## 🚀 NEXT STEPS

Once logged in, you can:
1. Click "Create Bot" 
2. Give it a name like "Support Bot"
3. We'll then build Phase 2 features:
   - Bot editor with 5 tabs
   - Upload documents
   - Add website URLs
   - Configure domains
   - Get embed code

---

**Need help? Send me:**
- Screenshot of any error
- Which step you're on
- What you see vs what you expect

I'm here to help! 😊
