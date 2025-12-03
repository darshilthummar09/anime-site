# Fix Firebase Configuration Error

## Quick Fix Steps

Your `.env.local` file already has the Firebase configuration values. You just need to **restart your development server** for the changes to take effect.

### Step 1: Stop the Current Server

1. Go to your terminal where `npm run dev` is running
2. Press `Ctrl + C` to stop the server

### Step 2: Restart the Server

```bash
npm run dev
```

### Step 3: Test Again

1. Navigate to `http://localhost:3000/signup`
2. Try creating an account again

## Why This Happens

Next.js only loads environment variables from `.env.local` when the server starts. If you:
- Added or changed values in `.env.local`
- Started the server before adding Firebase config

The server needs to be restarted to pick up the new environment variables.

## Verify Your Configuration

Your `.env.local` should have these variables set (which you already have):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCZiJEvZ40bLfT2gI1JH-zGwdRjWND-MOU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=animeflex-1539b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=animeflex-1539b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=animeflex-1539b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=549211954850
NEXT_PUBLIC_FIREBASE_APP_ID=1:549211954850:web:21a8b930889dbf01d801fb
```

## Still Getting Errors?

If you're still seeing the error after restarting:

1. **Check the browser console** for detailed error messages
2. **Verify Firebase is enabled** in Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `animeflex-1539b`
   - Go to **Authentication** → **Sign-in method**
   - Make sure **Email/Password** is enabled

3. **Clear browser cache**:
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

4. **Check Firestore is created**:
   - In Firebase Console, go to **Firestore Database**
   - If it says "Create database", click it and create it in test mode

## Troubleshooting

### Error persists after restart?
- Make sure `.env.local` is in the project root (same folder as `package.json`)
- Check for typos in variable names
- Ensure no extra spaces around the `=` sign

### Authentication works but Firestore errors?
- Make sure Firestore Database is created in Firebase Console
- Check Firestore security rules allow reads/writes for authenticated users

## Need More Help?

See the full setup guide: `FIREBASE_SETUP.md`

