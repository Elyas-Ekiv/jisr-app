# 📊 How to View Database Tables

## Option 1: Prisma Studio (Recommended - Visual Interface)

Prisma Studio is a visual database browser. It's the easiest way to view and edit your database.

### Start Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

**Or directly:**

```bash
npx prisma studio
```

### What happens:

1. Prisma Studio will open in your browser automatically
2. Usually opens at: `http://localhost:5555`
3. You'll see all your tables on the left sidebar
4. Click any table to view/edit data

### Features:

- ✅ View all records in each table
- ✅ Add new records
- ✅ Edit existing records
- ✅ Delete records
- ✅ Search and filter
- ✅ See relationships between tables

---

## Option 2: PostgreSQL Command Line (psql)

If you have PostgreSQL installed and want to use command line:

```bash
psql -U your_username -d jisr_db
```

Then run:

```sql
-- List all tables
\dt

-- View a specific table
SELECT * FROM users;

-- View table structure
\d users
```

---

## Option 3: Database GUI Tools

You can use any PostgreSQL GUI tool:

### Popular Options:

1. **pgAdmin** (Free, Official PostgreSQL tool)

   - Download: https://www.pgadmin.org/
   - Connect using your DATABASE_URL

2. **DBeaver** (Free, Cross-platform)

   - Download: https://dbeaver.io/
   - Supports PostgreSQL

3. **TablePlus** (Paid, Beautiful UI)

   - Download: https://tableplus.com/

4. **Postico** (Mac only, Paid)
   - Download: https://eggerapps.at/postico/

### Connection Details:

Use the same connection string from your `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/jisr_db"
```

Break it down:

- **Host:** localhost
- **Port:** 5432
- **Database:** jisr_db
- **Username:** (from your connection string)
- **Password:** (from your connection string)

---

## Option 4: VS Code Extension

If you use VS Code:

1. Install extension: **"PostgreSQL"** or **"SQLTools"**
2. Connect using your DATABASE_URL
3. Browse tables in the sidebar

---

## 🎯 Quick Start (Easiest Method)

**Just run this:**

```bash
cd backend
npm run prisma:studio
```

**That's it!** It will open in your browser and you can see all tables.

---

## 📋 What Tables You Should See

After running migrations, you should see these tables:

- ✅ `users` - User accounts
- ✅ `children` - Children profiles
- ✅ `vocabulary` - Vocabulary items
- ✅ `child_vocabulary` - Child-vocabulary assignments
- ✅ `aac_settings` - AAC settings per child
- ✅ `usage_analytics` - Usage tracking
- ✅ `payment_plans` - Subscription plans
- ✅ `discounts` - Discount codes
- ✅ `orders` - Payment orders
- ✅ `payments` - Payment records
- ✅ `refresh_tokens` - JWT refresh tokens
- ✅ `user_settings` - User preferences

---

## 💡 Tips

1. **Prisma Studio is best for quick viewing** - No setup needed
2. **pgAdmin/DBeaver are better for complex queries** - More powerful
3. **Prisma Studio auto-refreshes** - See changes immediately
4. **You can edit data directly** - Great for testing

---

## 🐛 If Prisma Studio Doesn't Open

1. Check if port 5555 is available
2. Make sure database is connected
3. Try: `npx prisma studio --port 5556` (different port)
4. Check server console for errors

---

**Recommended: Just use `npm run prisma:studio` - it's the easiest!** 🚀
