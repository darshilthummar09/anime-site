# ⚡ Quick Fix: Firestore Permissions Error

## The Error
"Missing or insufficient permissions" when signing up

## Quick Fix (2 minutes)

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project: **animeflex-1539b**

### Step 2: Update Security Rules
1. Click **Firestore Database** (left sidebar)
2. Click **Rules** tab (top)
3. **DELETE** all existing rules
4. **PASTE** these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish** button (top right)
6. Done! ✅

### Step 3: Test
Go back to your app and try signing up again. It should work now!

---

**Need more details?** See `FIRESTORE_SECURITY_RULES.md` for complete instructions.

