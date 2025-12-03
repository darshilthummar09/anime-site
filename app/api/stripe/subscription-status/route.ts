import { NextResponse } from 'next/server';
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const uid = searchParams.get('uid'); // Optional: user ID

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { 
        isPremium: false,
        error: 'Stripe is not configured'
      },
      { status: 200 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
      const purchaseDate = new Date(subscription.current_period_start * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);
      
      return NextResponse.json({
        isPremium,
        subscriptionId: subscription.id,
        status: subscription.status,
        purchaseDate: purchaseDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    }

    return NextResponse.json({ isPremium: false });
  } catch (error: any) {
    console.error('Stripe subscription status error:', error);
    return NextResponse.json(
      { 
        isPremium: false,
        error: error.message || 'Failed to check subscription status' 
      },
      { status: 200 }
    );
  }
}

