import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// Check if key is a placeholder
const isPlaceholderKey = stripeSecretKey.includes('your_secret_key_here') || 
                         stripeSecretKey.includes('sk_test_****************') ||
                         stripeSecretKey.length < 20;

if (!stripeSecretKey || isPlaceholderKey) {
  console.warn('STRIPE_SECRET_KEY is not set or is a placeholder. Stripe payments will not work.');
}

const stripe = stripeSecretKey && !isPlaceholderKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
  : null;

export async function POST(request: Request) {
  try {
    if (!stripe) {
      const isPlaceholder = stripeSecretKey.includes('your_secret_key_here') || 
                           stripeSecretKey.includes('sk_test_****************');
      return NextResponse.json(
        { 
          error: isPlaceholder 
            ? 'Invalid Stripe API key. Please replace the placeholder with your actual Stripe secret key from https://dashboard.stripe.com/test/apikeys'
            : 'Stripe is not configured. Please set STRIPE_SECRET_KEY in .env.local',
          message: 'See SETUP_STRIPE_NOW.md for instructions'
        },
        { status: 500 }
      );
    }

    const { priceId, userId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Validate price ID is not a placeholder
    if (priceId.includes('your_') || 
        priceId.includes('price_premium') || 
        priceId.includes('price_annual') ||
        !priceId.startsWith('price_') ||
        priceId.length < 15) {
      return NextResponse.json(
        { 
          error: 'Invalid Price ID. Please create products in Stripe Dashboard and add the actual Price IDs to .env.local',
          message: 'Price IDs should start with "price_" and be obtained from your Stripe Dashboard products'
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription`,
      metadata: {
        userId: userId || '', // Store user ID in metadata
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

