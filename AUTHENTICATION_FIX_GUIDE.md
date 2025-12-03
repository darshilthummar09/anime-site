# Authentication Fix Guide - Signup & Login

## What Was Fixed

I've fixed the authentication system with the following improvements:

### ✅ 1. Better Error Handling
- Specific error messages for different Firebase errors
- User-friendly error messages instead of technical codes
- Proper error handling in both signup and login

### ✅ 2. Improved Signup Flow
- Better error handling for Firestore permission errors
- Graceful handling if profile update fails
- Wait for auth state before redirecting

### ✅ 3. Improved Login Flow
- Better error messages for wrong password, user not found, etc.
- Proper redirect handling after login
- Support for redirect parameter

### ✅ 4. Error Messages Include
- Email already in use
- Wrong password
- User not found
- Invalid email
- Network errors
- Firestore permission errors
- Too many requests

## Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"
**Solution:** Update Firestore security rules (see `FIRESTORE_SECURITY_RULES.md`)

### Issue 2: "Firebase is not configured"
**Solution:** 
1. Check `.env.local` file has all Firebase config values
2. Restart your development server

### Issue 3: "Email already in use"
**Solution:** The email is already registered. Use the login page instead.

### Issue 4: "Wrong password" or "User not found"
**Solution:** Check your email and password. Make sure you're using the correct account.

## Testing Checklist

Before reporting issues, please check:

- [ ] Firebase is configured in `.env.local`
- [ ] Development server has been restarted after adding Firebase config
- [ ] Firestore Database is created in Firebase Console
- [ ] Firestore security rules are set (see `FIRESTORE_SECURITY_RULES.md`)
- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] Browser console shows no errors (F12 → Console tab)

## Step-by-Step Setup

### 1. Check Firebase Configuration
```bash
# Verify .env.local has all values
cat .env.local | grep FIREBASE
```

Should show:
- `NEXT_PUBLIC_FIREBASE_API_KEY=...`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=...`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...`
- `NEXT_PUBLIC_FIREBASE_APP_ID=...`

### 2. Check Firestore Rules
1. Go to Firebase Console
2. Firestore Database → Rules
3. Should have rules allowing users to create/read their own documents

### 3. Check Authentication
1. Go to Firebase Console
2. Authentication → Sign-in method
3. Email/Password should be **Enabled**

### 4. Test Signup
1. Go to `/signup`
2. Fill in name, email, password
3. Click Sign Up
4. Should redirect to home page
5. Check Firebase Console → Authentication → Users (should see new user)
6. Check Firestore Database → users collection (should see user document)

### 5. Test Login
1. Sign out if logged in
2. Go to `/login`
3. Enter email and password
4. Click Sign In
5. Should redirect to home page
6. Navbar should show your name

## Still Having Issues?

### Check Browser Console
1. Open browser console (F12)
2. Look for red error messages
3. Copy the error message
4. Check which error category it falls into above

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signing up/login
4. Look for failed requests (red)
5. Check the error response

### Verify Firebase Setup
1. Firebase Console → Authentication → Users
   - Should see your users here after signup
2. Firebase Console → Firestore Database → Data
   - Should see `users` collection
   - Each user should have a document with their UID

## Code Changes Made

### `contexts/AuthContext.tsx`
- ✅ Better error handling in `signIn` and `signUp`
- ✅ Specific error messages for each error type
- ✅ Wait for auth state updates

### `app/login/page.tsx`
- ✅ Better error messages
- ✅ Support for redirect parameter
- ✅ User-friendly error display

### `app/signup/page.tsx`
- ✅ Better error messages
- ✅ Wait for auth state before redirect
- ✅ Handle all error types

## Next Steps

1. **Test signup:** Create a new account
2. **Test login:** Sign in with the account
3. **Test signout:** Sign out and verify
4. **Check Firestore:** Verify user document is created
5. **Check Premium:** Verify new users are non-premium by default

If you're still experiencing issues after following this guide, check the browser console for specific error messages.

