# Fix Firestore "Missing or insufficient permissions" Error

## Problem

When signing up, you see the error "Missing or insufficient permissions." This happens because Firestore security rules are blocking the creation of user documents.

## Solution: Update Firestore Security Rules

You need to update your Firestore security rules to allow authenticated users to create and manage their own user documents.

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **animeflex-1539b**

### Step 2: Navigate to Firestore Rules

1. In the left sidebar, click on **Firestore Database**
2. Click on the **Rules** tab (at the top)

### Step 3: Replace the Rules

You'll see the current rules. Replace them with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null; // Allow creating own document during signup
    }
    
    // Allow all reads/writes for development (remove in production)
    // Uncomment these lines ONLY for development/testing:
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### Step 4: Publish the Rules

1. Click the **Publish** button (top right)
2. Wait for confirmation that rules are published

### Step 5: Test Again

1. Go back to your app
2. Try signing up again
3. The error should be resolved!

## Alternative: Development Mode (Temporary)

If you want to allow all authenticated users to read/write (for development only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT ONLY - Allows all authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: These rules allow any authenticated user to read/write all data. Use ONLY for development. Not for production!**

## Recommended Production Rules

For production, use these more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny access to all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Important: Subscription Updates

When a user purchases a subscription, the premium status is updated from the **client side** (browser) where the user is authenticated. This is why the security rules require the authenticated user's UID to match the document ID.

The subscription success page updates Firestore using the authenticated user's context, so these rules work correctly.

## Troubleshooting

### Rules won't publish?
- Make sure you have the correct permissions in Firebase
- Check for syntax errors in the rules
- Try copying the rules again

### Still getting permission errors after subscription purchase?
1. Make sure you're logged in when purchasing
2. Check that the security rules are published (see Step 4 above)
3. Verify the user ID matches the document ID in Firestore
4. See `FIX_SUBSCRIPTION_PERMISSION_ERROR.md` for subscription-specific fixes

### Still getting permission errors during signup?
- Make sure you're authenticated (check Firebase Authentication)
- Verify the user ID matches the document ID
- Check browser console for more details
- Make sure security rules include the `allow create` permission

### Need help?
- See `FIX_SUBSCRIPTION_PERMISSION_ERROR.md` for subscription errors
- See [Firebase Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)

