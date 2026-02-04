# 📚 Step-by-Step MongoDB Connection Guide

This guide will help you ensure your MongoDB database is properly connected to your Next.js application.

---

## ✅ **Step 1: Verify MongoDB Atlas Cluster is Running**

### Check in MongoDB Atlas Dashboard:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your account
3. Select your project
4. In the left sidebar, click **"Database"**
5. **Look for your cluster status:**
   - ✅ **Active/Running** = Good to go
   - ⏸️ **Paused** = Click "Resume" button
   - 🔴 **Stopped** = Click "Start" button

> **Important:** Free tier clusters auto-pause after 60 days of inactivity!

---

## ✅ **Step 2: Configure Network Access (IP Whitelist)**

### Allow Your Application to Connect:

1. In MongoDB Atlas, click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. **Choose one option:**
   
   **Option A - Allow All IPs (Easiest for Development):**
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Click "Confirm"
   
   **Option B - Add Your Current IP:**
   - Click "Add Current IP Address"
   - Click "Confirm"

> **Note:** For production, use specific IPs or VPC peering.

---

## ✅ **Step 3: Get Correct Connection String**

### From MongoDB Atlas:

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. Copy the connection string

### Your Connection String Format:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Fill in the Details:
- **username:** `ayushbhardwajservice_db_user`
- **password:** `X5DZVYABfCUZ2YaT`
- **cluster:** `upsc-tracker.38sclhc`
- **database:** `upsc-tracker`

### Final Connection String:
```
mongodb+srv://ayushbhardwajservice_db_user:X5DZVYABfCUZ2YaT@upsc-tracker.38sclhc.mongodb.net/upsc-tracker?retryWrites=true&w=majority
```

---

## ✅ **Step 4: Update Environment File**

### Edit `.env.local` File:

Your file should look like this:

```env
# Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCCrgoa4SPusFLeT6Bzia-APPd0ojWxY_w

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://ayushbhardwajservice_db_user:X5DZVYABfCUZ2YaT@upsc-tracker.38sclhc.mongodb.net/upsc-tracker?retryWrites=true&w=majority&appName=upsc-tracker
```

> **Important:** Delete the old `.env` file if it exists. Next.js uses `.env.local`.

---

## ✅ **Step 5: Test Connection Independently**

### Run the Connection Test Script:

```bash
node scripts/test-db-connection.js
```

### Expected Output (Success):

```
🧪 MongoDB Connection Test
==================================================
📍 Connection String: mongodb+srv://***:***@upsc-tracker.38sclhc.mongodb.net/upsc-tracker?...
🔄 Attempting connection...

✅ SUCCESS! MongoDB Connected
📊 Database Name: upsc-tracker
🌐 Host: upsc-tracker-shard-00-02.38sclhc.mongodb.net
🔢 Port: 27017

✨ Connection test passed!
```

### If Test Fails:

**Error: ECONNREFUSED**
- Cluster is paused → Resume in Atlas
- IP not whitelisted → Add 0.0.0.0/0
- Wrong connection string → Verify credentials
- DNS issues → Try solutions below

---

## ✅ **Step 6: Fix DNS Issues (If Needed)**

### Windows:

```bash
# Flush DNS cache
ipconfig /flushdns

# Restart DNS client
net stop dnscache
net start dnscache
```

### Mac/Linux:

```bash
# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Alternative: Use Standard Connection String

If SRV lookup fails, try the standard format:

```env
MONGO_URI=mongodb://ayushbhardwajservice_db_user:X5DZVYABfCUZ2YaT@upsc-tracker-shard-00-00.38sclhc.mongodb.net:27017,upsc-tracker-shard-00-01.38sclhc.mongodb.net:27017,upsc-tracker-shard-00-02.38sclhc.mongodb.net:27017/upsc-tracker?replicaSet=atlas-xxxxx-shard-0&ssl=true&authSource=admin
```

> Get this from MongoDB Atlas → Connect → "Connect with MongoDB Compass"

---

## ✅ **Step 7: Restart Development Server**

### Stop Current Server:

Press `Ctrl + C` in your terminal

### Clear Next.js Cache:

```bash
rm -rf .next
```

### Restart Server:

```bash
npm run dev
```

### Watch for Success Message:

```
🔄 Attempting to connect to MongoDB...
📍 URI: mongodb+srv://***:***@upsc-tracker.38sclhc.mongodb.net/upsc-tracker
✅ MongoDB Connected Successfully
📊 Database: upsc-tracker
```

---

## ✅ **Step 8: Test in Browser**

### 1. Open Registration Page:
```
http://localhost:3000/register
```

### 2. Try Creating a User:
- Enter a unique User ID (e.g., "testuser123")
- Click "Create Account"

### 3. Check Terminal Output:
Should see:
```
✅ MongoDB Connected Successfully
POST /api/users 200 in XXXms
```

### 4. Verify in MongoDB Compass:
1. Open MongoDB Compass
2. Connect to your cluster
3. Navigate to: `upsc-tracker` → `users` collection
4. You should see your new user!

---

## 🔧 **Troubleshooting Checklist**

- [ ] MongoDB Atlas cluster is **running** (not paused)
- [ ] IP whitelist includes `0.0.0.0/0` or your current IP
- [ ] Connection string has correct username, password, cluster, and database
- [ ] `.env.local` file exists in project root (not `.env`)
- [ ] Development server was restarted after `.env.local` changes
- [ ] DNS cache was flushed
- [ ] Firewall/antivirus not blocking connections
- [ ] Internet connection is stable
- [ ] MongoDB Compass can connect successfully

---

## 🆘 **Still Having Issues?**

### Check These Logs:

1. **Terminal Output:** Look for MongoDB connection messages
2. **Browser Console:** Check for API errors
3. **MongoDB Atlas Logs:** Cluster → Metrics → View Logs

### Common Error Messages:

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Cluster paused or IP not whitelisted |
| `Authentication failed` | Wrong username/password |
| `Hostname not found` | DNS issues or wrong cluster URL |
| `Timeout` | Network/firewall blocking connection |

---

## ✅ **Success Indicators**

You'll know everything is working when:

1. ✅ Terminal shows: `✅ MongoDB Connected Successfully`
2. ✅ No `❌ MongoDB Connection Error` messages
3. ✅ Can register new users without localStorage fallback
4. ✅ Data appears in MongoDB Compass
5. ✅ Login works across different browsers

---

## 📝 **Quick Reference**

### Connection Test Command:
```bash
node scripts/test-db-connection.js
```

### Restart Server:
```bash
npm run dev
```

### Check Environment Variable:
```bash
# Windows PowerShell
echo $env:MONGO_URI

# Mac/Linux
echo $MONGO_URI
```

### MongoDB Atlas Dashboard:
[https://cloud.mongodb.com/](https://cloud.mongodb.com/)

---

**Last Updated:** 2026-02-04
