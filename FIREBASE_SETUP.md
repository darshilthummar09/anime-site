# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for the AnimeFlix application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "animeflix")
4. Follow the setup wizard
5. Click "Continue" when asked about Google Analytics (optional)

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set Up Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
   - **Test mode**: Allows read/write access for 30 days
   - **Production mode**: You'll need to set up security rules manually
4. Select a location for your database (choose one closest to your users)
5. Click **Enable**

### Security Rules (Important - Required for Signup!)

**⚠️ IMPORTANT:** You MUST set up these rules or signup will fail with "Missing or insufficient permissions" error!

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null; // Allow creating own document during signup
    }
  }
}
```

3. Click **Publish**

**📋 Quick Reference:** See `QUICK_FIX_PERMISSIONS.md` for a 2-minute quick fix guide.

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the web icon (</> icon)
5. Register your app with a nickname (e.g., "AnimeFlix Web")
6. Copy the configuration object - you'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Add Configuration to Your Project

1. Copy `env.local.template` to `.env.local` (if you haven't already)
2. Add your Firebase configuration values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 6: Install Dependencies

If you haven't already, install Firebase:

```bash
npm install firebase
```

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/signup` and create a test account
3. Check your Firebase Console:
   - **Authentication** > **Users** - You should see your new user
   - **Firestore Database** > **Data** - You should see a `users` collection with a document for your user

## Features Enabled

With Firebase set up, you now have:

✅ **User Authentication**
- Sign up with email/password
- Sign in
- Sign out
- Protected routes

✅ **User Database (Firestore)**
- User profiles stored in Firestore
- Premium status tracking
- User data persistence

✅ **Premium User Management**
- Premium status stored in Firestore
- Automatic premium status check on login
- Premium status sync with Stripe subscriptions

## Troubleshooting

### Authentication Errors

- **Error: "Firebase: Error (auth/network-request-failed)"**
  - Check your internet connection
  - Verify your Firebase configuration is correct

- **Error: "Firebase: Error (auth/email-already-in-use)"**
  - The email is already registered
  - Try signing in instead

### Firestore Errors

- **Error: "Missing or insufficient permissions"**
  - Check your Firestore security rules
  - Make sure you're authenticated when trying to read/write

- **Error: "Firestore database not found"**
  - Make sure you've created the Firestore database
  - Verify your project ID is correct

### Configuration Errors

- **Error: "Firebase app is not initialized"**
  - Check that all environment variables are set correctly
  - Make sure `.env.local` file exists and is in the project root
  - Restart your development server after changing environment variables

## Next Steps

1. Set up security rules for production
2. Configure additional authentication providers (Google, GitHub, etc.) if needed
3. Set up Firebase Storage if you need to store user-uploaded content
4. Configure Firebase Hosting if you want to deploy to Firebase

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)

