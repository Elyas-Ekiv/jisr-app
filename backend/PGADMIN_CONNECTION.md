# 🔌 Connect pgAdmin to Your Database

## Step-by-Step Guide

### Step 1: Get Your Connection Details

Check your `backend/.env` file for the `DATABASE_URL`. It looks like:
```
DATABASE_URL="postgresql://username:password@localhost:5432/jisr_db"
```

**Break it down:**
- **Username:** The part before `:` (after `postgresql://`)
- **Password:** The part after `:` and before `@`
- **Host:** Usually `localhost` (the part after `@` and before `:`)
- **Port:** Usually `5432` (the part after `:` and before `/`)
- **Database:** Usually `jisr_db` (the part after `/`)

**Example:**
```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/jisr_db"
```
- Username: `postgres`
- Password: `mypassword`
- Host: `localhost`
- Port: `5432`
- Database: `jisr_db`

---

### Step 2: Open pgAdmin

1. Launch pgAdmin
2. You'll see the pgAdmin interface

---

### Step 3: Add a New Server

1. **Right-click** on "Servers" in the left sidebar
2. Select **"Register" → "Server..."**

---

### Step 4: Fill in Connection Details

#### General Tab:
- **Name:** `Jisr Database` (or any name you want)

#### Connection Tab:
- **Host name/address:** `localhost` (or from your DATABASE_URL)
- **Port:** `5432` (or from your DATABASE_URL)
- **Maintenance database:** `jisr_db` (or from your DATABASE_URL)
- **Username:** Your username (from DATABASE_URL)
- **Password:** Your password (from DATABASE_URL)
- ✅ **Check "Save password"** (optional, but convenient)

#### Advanced Tab (Optional):
- **DB restriction:** Leave empty or enter `jisr_db`

#### SSL Tab:
- **SSL mode:** `Prefer` or `Disable` (for local development)

---

### Step 5: Save and Connect

1. Click **"Save"**
2. pgAdmin will try to connect
3. If successful, you'll see your server in the left sidebar

---

### Step 6: Browse Your Tables

1. **Expand** your server in the left sidebar
2. **Expand** "Databases"
3. **Expand** `jisr_db` (or your database name)
4. **Expand** "Schemas"
5. **Expand** "public"
6. **Click** "Tables"

**You should see all your tables:**
- users
- children
- vocabulary
- child_vocabulary
- aac_settings
- usage_analytics
- payment_plans
- discounts
- orders
- payments
- refresh_tokens
- user_settings

---

### Step 7: View Table Data

1. **Right-click** on any table (e.g., "users")
2. Select **"View/Edit Data" → "All Rows"**
3. You'll see all the data in that table

---

## 🐛 Troubleshooting

### Issue: "Unable to connect to server"

**Possible fixes:**
1. **Check PostgreSQL is running:**
   - Windows: Check Services (search "services.msc"), look for "postgresql"
   - Mac/Linux: `sudo service postgresql status`

2. **Check port 5432:**
   - Make sure nothing else is using port 5432
   - Try changing port in DATABASE_URL if needed

3. **Check username/password:**
   - Verify they match your DATABASE_URL exactly
   - Try connecting with psql first to test credentials

4. **Check firewall:**
   - Make sure firewall isn't blocking PostgreSQL

### Issue: "Database does not exist"

**Fix:**
1. Make sure you ran migrations: `npm run prisma:migrate`
2. Check database name matches in DATABASE_URL
3. Create database manually if needed:
   ```sql
   CREATE DATABASE jisr_db;
   ```

### Issue: "Password authentication failed"

**Fix:**
1. Double-check password in DATABASE_URL
2. Try resetting PostgreSQL password
3. Check `pg_hba.conf` file for authentication settings

---

## 💡 Quick Tips

1. **Save password** - Check "Save password" so you don't have to enter it every time
2. **Use Query Tool** - Right-click database → "Query Tool" to run SQL queries
3. **Refresh** - Right-click and "Refresh" if tables don't appear
4. **View Data** - Right-click table → "View/Edit Data" to see records

---

## 📊 Useful pgAdmin Features

### View Table Structure:
- Right-click table → "Properties" → "Columns" tab

### Run SQL Queries:
- Right-click database → "Query Tool"
- Type SQL and press F5 to execute

### Export Data:
- Right-click table → "Backup" or "Export/Import"

### Import Data:
- Right-click table → "Import/Export"

---

## ✅ Quick Connection Checklist

- [ ] Got connection details from `.env` file
- [ ] Opened pgAdmin
- [ ] Added new server
- [ ] Filled in connection details
- [ ] Saved and connected
- [ ] Can see database in sidebar
- [ ] Can see tables under "Schemas" → "public" → "Tables"
- [ ] Can view data in tables

---

**Once connected, you can browse all your tables and data!** 🎉

