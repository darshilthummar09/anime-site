import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const isPlaceholderKey = stripeSecretKey.includes('your_secret_key_here') || 
                         stripeSecretKey.includes('sk_test_****************') ||
                         stripeSecretKey.length < 20;

const stripe = stripeSecretKey && !isPlaceholderKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, sessionId } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID (uid) is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Get Stripe session and subscription details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found in session' },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Calculate dates
    const purchaseDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const isPremium = subscription.status === 'active' || subscription.status === 'trialing';

    // Update user document in Firestore
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      isPremium: isPremium,
      premiumPurchaseDate: purchaseDate,
      premiumEndDate: endDate,
      subscriptionId: subscription.id,
      premiumUpdatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      isPremium,
      purchaseDate: purchaseDate.toISOString(),
      endDate: endDate.toISOString(),
      subscriptionId: subscription.id,
    });
  } catch (error: any) {
    console.error('Error updating premium status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update premium status' },
      { status: 500 }
    );
  }
}

