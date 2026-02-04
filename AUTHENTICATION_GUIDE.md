# 🔐 Authentication & Session Persistence Guide

This guide explains how the UPSC Tracker Pro handles authentication and keeps users logged in across browser sessions.

---

## 📋 **Overview**

The application uses **localStorage** for authentication persistence, ensuring users remain logged in even after closing and reopening the browser.

### **Key Features:**
✅ Automatic login persistence  
✅ Auto-redirect to dashboard for logged-in users  
✅ Session conflict detection (multi-device awareness)  
✅ Secure logout with complete cache clearing  
✅ MongoDB + localStorage hybrid storage for reliability

---

## 🔄 **How It Works**

### **1. User Registration Flow**

```
User enters unique ID → Check availability → Create account
    ↓
Save to MongoDB (primary storage)
    ↓
Save to localStorage (cache + fallback)
    ↓
Auto-login → Redirect to /dashboard
```

**Files involved:**
- `app/(auth)/register/page.tsx` - Registration UI
- `app/api/users/route.ts` - User creation API
- `services/storage.ts` - localStorage management

### **2. User Login Flow**

```
User enters ID → Verify in MongoDB → User found
    ↓
Save to localStorage (authentication cache)
    ↓
Redirect to /dashboard
```

**Files involved:**
- `app/(auth)/login/page.tsx` - Login UI
- `app/api/users/route.ts` - User verification API
- `services/storage.ts` - Authentication caching

### **3. Authentication Check on Page Load**

Every protected page checks for authentication:

```javascript
useEffect(() => {
  const user = storageService.getAuthUser();
  
  if (!user) {
    router.push('/login'); // Not authenticated
  } else {
    // User is logged in, continue
  }
}, []);
```

**Pages with authentication check:**
- `app/page.tsx` (Landing page - redirects if logged in)
- `app/(auth)/login/page.tsx` (Login - redirects if already logged in)
- `app/(auth)/register/page.tsx` (Register - redirects if already logged in)
- `app/dashboard/page.tsx` (Dashboard - redirects if not logged in)

---

## 💾 **localStorage Keys**

The application uses these localStorage keys:

| Key | Purpose | Example Value |
|-----|---------|---------------|
| `upsc_tracker_auth_user` | Stores authenticated user data | `{"id":"john123","name":"John","email":"..."}` |
| `upsc_tracker_session` | Stores session info (device tracking) | `{"userId":"john123","deviceId":"abc123",...}` |
| `upsc_progress_[userId]` | User-specific progress data | `{"completedTaskIds":["task1","task2"],...}` |

---

## 🔍 **Authentication Check Implementation**

### **Landing Page** (`app/page.tsx`)

```typescript
useEffect(() => {
  setTimeout(() => {
    const user = storageService.getAuthUser();
    
    if (user) {
      // Already logged in → Go to dashboard
      router.push('/dashboard');
    } else {
      // Not logged in → Show landing page
      setIsChecking(false);
    }
  }, 100);
}, [router]);
```

**Why the delay?**  
The 100ms delay ensures localStorage is fully initialized in the browser before checking authentication.

### **Dashboard Page** (`app/dashboard/page.tsx`)

```typescript
useEffect(() => {
  setTimeout(() => {
    const user = storageService.getAuthUser();
    
    if (!user) {
      // Not logged in → Redirect to login
      router.push('/login');
      return;
    }
    
    // Logged in → Load user data
    setCurrentUser(user);
  }, 50);
}, [router]);
```

### **Login/Register Pages**

```typescript
useEffect(() => {
  setTimeout(() => {
    const user = storageService.getAuthUser();
    
    if (user) {
      // Already logged in → Go to dashboard
      router.push('/dashboard');
    }
  }, 50);
}, [router]);
```

**Why check on login/register?**  
Prevents logged-in users from accidentally creating duplicate accounts or logging in again.

---

## 🔐 **Storage Service API**

### **Authentication Methods**

#### **Save User (Login/Register)**
```typescript
storageService.saveAuthUser(user: User);
```
Stores user data in localStorage for persistent authentication.

#### **Get User (Check Login Status)**
```typescript
const user = storageService.getAuthUser();
// Returns: User | null
```
Retrieves logged-in user data, or null if not authenticated.

#### **Logout (Clear Auth)**
```typescript
storageService.clearAuth();
```
Removes authentication and session data from localStorage.

### **Session Methods**

#### **Save Session**
```typescript
storageService.saveSession(session: Session);
```
Stores session info for multi-device conflict detection.

#### **Get Session**
```typescript
const session = storageService.getSession();
// Returns: Session | null
```

---

## 🔄 **Session Conflict Detection**

The app detects when the same user ID is used on multiple devices:

```typescript
const currentSession = storageService.getSession();
if (currentSession && currentSession.deviceId !== session.deviceId) {
  // Another device logged in with this ID
  setSessionConflict(true);
  setTimeout(() => handleLogout(), 3000);
}
```

**Session heartbeat:** Every 15 seconds  
**Action:** Auto-logout on conflict

---

## 🛡️ **Security Considerations**

### **What's Stored:**
- ✅ User ID (username)
- ✅ Display name (optional)
- ✅ Email (optional)
- ✅ Session device ID

### **What's NOT Stored:**
- ❌ Passwords (app uses unique ID only)
- ❌ Sensitive personal data
- ❌ Payment information

### **localStorage Security:**
- Data is stored **locally** on the user's device
- **Not transmitted** to servers except during API calls
- **Cleared on logout** or manual cache clear
- Session conflicts prevent unauthorized multi-device use

---

## 📱 **Cross-Device Sync**

### **How It Works:**

1. **User logs in on Device A**
   - Auth saved to Device A's localStorage
   - Progress synced to MongoDB

2. **User opens app on Device B**
   - Logs in with same User ID
   - Auth saved to Device B's localStorage
   - Progress loaded from MongoDB

3. **Device A detects conflict**
   - Session check fails (different deviceId)
   - Auto-logout from Device A
   - Warning message shown

### **Why This Approach?**

- ✅ Prevents simultaneous multi-device usage
- ✅ Ensures data consistency
- ✅ Simple and reliable
- ✅ No complex token management needed

---

## 🧪 **Testing Authentication Persistence**

### **Test 1: Browser Refresh**
1. Login to the app
2. Refresh the browser (F5 or Ctrl+R)
3. ✅ Should remain logged in (stay on dashboard)

### **Test 2: Close & Reopen Browser**
1. Login to the app
2. Close the entire browser window
3. Reopen browser and go to the app URL
4. ✅ Should automatically redirect to dashboard

### **Test 3: Direct URL Navigation**
1. Login to the app
2. Navigate to `/login` or `/register` in address bar
3. ✅ Should redirect to dashboard (already logged in)

### **Test 4: Logout**
1. Login to the app
2. Click "Logout" button
3. ✅ Should redirect to `/login`
4. Refresh browser
5. ✅ Should stay on login page (auth cleared)

### **Test 5: Multi-Device Conflict**
1. Login on Browser A
2. Login with same ID on Browser B
3. ✅ Browser A should show conflict warning and logout

---

## 🐛 **Troubleshooting**

### **Problem: User keeps getting logged out**

**Causes:**
- Browser is clearing localStorage automatically
- Private/Incognito mode (clears on close)
- Browser storage quota exceeded
- Third-party cookies blocked

**Solutions:**
- Use regular browser window (not incognito)
- Check browser storage settings
- Clear old data: `localStorage.clear()`
- Ensure localStorage is enabled

### **Problem: Stuck on loading screen**

**Causes:**
- localStorage access blocked
- JavaScript error preventing auth check

**Solutions:**
- Check browser console for errors
- Enable localStorage in browser settings
- Clear browser cache and reload

### **Problem: Can't logout**

**Causes:**
- JavaScript error in logout function
- localStorage write permission denied

**Solutions:**
- Use browser developer tools to manually clear localStorage
- Check console for errors
- Try different browser

---

## 🔧 **Manual localStorage Management**

### **Check Current Authentication (Browser Console):**
```javascript
// Get stored user
JSON.parse(localStorage.getItem('upsc_tracker_auth_user'))

// Get session
JSON.parse(localStorage.getItem('upsc_tracker_session'))

// Get progress (replace 'userId' with actual ID)
JSON.parse(localStorage.getItem('upsc_progress_userId'))
```

### **Manual Logout (Browser Console):**
```javascript
localStorage.removeItem('upsc_tracker_auth_user');
localStorage.removeItem('upsc_tracker_session');
location.reload();
```

### **Clear All Data (Browser Console):**
```javascript
localStorage.clear();
location.reload();
```

---

## 📊 **File Structure**

```
app/
├── page.tsx                          # Landing page (auth check)
├── (auth)/
│   ├── login/page.tsx               # Login (auth check + redirect)
│   └── register/page.tsx            # Register (auth check + redirect)
└── dashboard/page.tsx                # Dashboard (requires auth)

services/
└── storage.ts                        # localStorage service

types.ts                              # User, Session interfaces
```

---

## ✅ **Best Practices**

1. **Always check auth on protected pages**
   ```typescript
   const user = storageService.getAuthUser();
   if (!user) router.push('/login');
   ```

2. **Use delays for localStorage reads**
   ```typescript
   setTimeout(() => {
     const user = storageService.getAuthUser();
   }, 50-100);
   ```

3. **Clear auth on logout**
   ```typescript
   storageService.clearAuth();
   router.push('/login');
   ```

4. **Sync to MongoDB after localStorage**
   ```typescript
   storageService.saveAuthUser(user);    // Cache
   await apiStorageService.saveUser(user); // Cloud
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     const user = storageService.getAuthUser();
   } catch (err) {
     console.error('Auth check failed:', err);
     router.push('/login');
   }
   ```

---

## 🚀 **Quick Reference**

| Action | Code |
|--------|------|
| Check if logged in | `storageService.getAuthUser()` |
| Save login | `storageService.saveAuthUser(user)` |
| Logout | `storageService.clearAuth()` |
| Get session | `storageService.getSession()` |
| Redirect to dashboard | `router.push('/dashboard')` |
| Redirect to login | `router.push('/login')` |

---

**Last Updated:** 2026-02-04  
**Version:** 1.0
