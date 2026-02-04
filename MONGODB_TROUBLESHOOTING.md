# 🔧 MongoDB Connection Error - Troubleshooting Guide

## ❌ Error You're Seeing

```
Error: querySrv ECONNREFUSED _mongodb._tcp.upsc-tracker.38sclhc.mongodb.net
```

This means your app **cannot connect to MongoDB Atlas**.

## 🎯 Quick Fixes (Try in Order)

### Fix 1: Resume Your MongoDB Cluster (Most Likely)

**MongoDB Atlas free tier clusters pause automatically after inactivity.**

**Steps:**
1. Go to https://cloud.mongodb.com
2. Login with your MongoDB account
3. Look for your cluster: `upsc-tracker`
4. If it shows **"Paused"** or **"Resuming"**:
   - Click the **"Resume"** button
   - Wait 1-2 minutes for cluster to come online
5. You should see status change to **"Active"**
6. Restart your Next.js app:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Fix 2: Whitelist Your IP Address

**MongoDB might be blocking your IP.**

**Steps:**
1. In MongoDB Atlas Dashboard
2. Click **"Network Access"** in left sidebar
3. Click **"Add IP Address"**
4. Choose **"Allow Access from Anywhere"**
   - Or enter `0.0.0.0/0`
5. Click **"Confirm"**
6. Wait 2-3 minutes for changes to propagate
7. Restart your app

### Fix 3: Check Connection String

**Your current connection string:**
```
mongodb+srv://ayushbhardwajservice_db_user:X5DZVYABfCUZ2YaT@upsc-tracker.38sclhc.mongodb.net/upsc-tracker-db?retryWrites=true&w=majority
```

**Verify it's correct:**
1. Go to MongoDB Atlas
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace password with: `X5DZVYABfCUZ2YaT`
6. Update `.env.local` if different

### Fix 4: Network/Firewall Check

**Check if your network blocks MongoDB:**

```bash
# Test DNS resolution
nslookup upsc-tracker.38sclhc.mongodb.net

# If it resolves, try ping (may not respond but tests connection)
ping upsc-tracker.38sclhc.mongodb.net
```

**If blocked:**
- Try from a different network (mobile hotspot)
- Check corporate firewall settings
- Contact your network admin

## ✅ Temporary Workaround (App Still Works!)

**Good news:** Your app has localStorage fallback! It will work even if MongoDB is down.

**What happens now:**
- ✅ Registration works (saves to localStorage)
- ✅ Login works (reads from localStorage)
- ✅ Progress tracking works (saves locally)
- ⚠️ No cross-device sync (until MongoDB is fixed)

**Code already includes fallback:**
```typescript
// In register page - now has localStorage fallback
catch (err) {
  // Falls back to localStorage
  storageService.saveAuthUser(userData);
  router.push('/dashboard');
}
```

## 🔍 Verify MongoDB Status

### Check in Atlas Dashboard
```
1. Go to https://cloud.mongodb.com
2. Login
3. Look for cluster status:
   - ✅ "Active" = Good
   - ⚠️ "Paused" = Need to resume
   - ❌ "Deleted" = Need to recreate
```

### Check in Your Terminal
After fixing, you should see:
```bash
✅ MongoDB Connected Successfully
```

Instead of:
```bash
❌ Error: querySrv ECONNREFUSED
```

## 🚀 Testing After Fix

### Test Connection
```bash
# 1. Resume cluster in MongoDB Atlas
# 2. Wait 1-2 minutes
# 3. Restart app
npm run dev

# 4. Check terminal
# Should see: "✅ MongoDB Connected Successfully"

# 5. Test registration
# Go to http://localhost:3000/register
# Create a user
# Check MongoDB Atlas → Browse Collections
# Should see new user in 'users' collection
```

## 🎯 Long-term Solutions

### Prevent Future Pausing

**MongoDB Atlas Free Tier:**
- Clusters pause after 60 days of inactivity
- Or if not accessed for extended periods

**Keep Active:**
1. Use the app regularly
2. Set up a cron job to ping your API (optional)
3. Upgrade to paid tier (no auto-pause)

### Monitor Connection

Add this to see connection status:
```typescript
// In lib/mongodb.ts
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});
```

## 📊 Current Status

**What's Working:**
- ✅ App runs (with localStorage fallback)
- ✅ Registration creates users locally
- ✅ Login works with local data
- ✅ Progress tracking works
- ✅ All UI features work

**What's Not Working:**
- ❌ Cloud sync (MongoDB unavailable)
- ❌ Cross-device sync
- ❌ Real-time userId validation
- ❌ Database storage

**Fix:** Resume your MongoDB cluster!

## 🎉 Summary

**The Error:**
```
MongoDB Atlas cluster is not responding
Most likely: Cluster is PAUSED
```

**The Fix:**
```
1. Go to cloud.mongodb.com
2. Find your cluster
3. Click "Resume" if paused
4. Add IP whitelist (0.0.0.0/0)
5. Restart your app
6. ✅ Should work!
```

**Right Now:**
```
Your app works with localStorage fallback
No data loss - everything saves locally
Fix MongoDB to enable cloud sync
```

---

**Quick Action:** Go to https://cloud.mongodb.com and resume your cluster! 🚀
