'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiCheck, FiStar } from 'react-icons/fi';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const isPlaceholderKey = stripeKey.includes('your_publishable_key_here') || stripeKey.length < 20;
const stripePromise = stripeKey && !isPlaceholderKey ? loadStripe(stripeKey) : null;

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/subscription');
    }
  }, [user, authLoading, router]);

  const handleSubscribe = async (priceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    if (!stripeKey || stripeKey.includes('your_publishable_key_here')) {
      alert('Stripe is not configured. Please set up your Stripe keys in .env.local\n\nSee SETUP_STRIPE_NOW.md for instructions.');
      return;
    }

    // Validate price ID is not a placeholder
    if (!priceId || 
        priceId.includes('your_') || 
        priceId.includes('price_premium') || 
        priceId.includes('price_annual') ||
        !priceId.startsWith('price_') ||
        priceId.length < 15) {
      alert('Invalid Price ID. Please create products in Stripe Dashboard and add the Price IDs to .env.local\n\nSee SETUP_STRIPE_NOW.md for instructions.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId,
          userId: user?.uid || null, // Pass user ID if logged in
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create checkout session';
        
        // Show user-friendly error messages
        if (errorMessage.includes('No such price') || errorMessage.includes('Invalid Price ID')) {
          throw new Error('Invalid Price ID. Please create products in Stripe Dashboard and add the Price IDs to .env.local\n\nSee SETUP_STRIPE_NOW.md for instructions.');
        }
        
        throw new Error(errorMessage);
      }

      const { sessionId, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }
      
      if (!stripePromise) {
        throw new Error('Stripe not initialized');
      }

      const stripe = await stripePromise;

      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Failed to start checkout. Please check your Stripe configuration in .env.local');
    } finally {
      setLoading(false);
    }
  };

  // Get price IDs from environment, but validate they're not placeholders
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '';
  
  // Check if they're Product IDs instead of Price IDs
  const isMonthlyProductId = monthlyPriceId.startsWith('prod_');
  const isAnnualProductId = annualPriceId.startsWith('prod_');
  
  const isMonthlyPriceValid = monthlyPriceId && 
    !monthlyPriceId.includes('your_') && 
    !monthlyPriceId.includes('price_premium') &&
    monthlyPriceId.startsWith('price_') &&
    monthlyPriceId.length > 15;
    
  const isAnnualPriceValid = annualPriceId && 
    !annualPriceId.includes('your_') && 
    !annualPriceId.includes('price_annual') &&
    annualPriceId.startsWith('price_') &&
    annualPriceId.length > 15;

  const plans = [
    {
      name: 'Basic',
      price: '$0',
      period: 'Free',
      features: [
        'Limited anime access',
        'Standard quality',
        'Ads included',
        'Basic support',
      ],
      priceId: null,
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      features: [
        'Unlimited anime access',
        'HD & 4K quality',
        'No ads',
        'Download for offline',
        'Priority support',
        'Early access to new episodes',
      ],
      priceId: isMonthlyPriceValid ? monthlyPriceId : null,
      popular: true,
    },
    {
      name: 'Premium Annual',
      price: '$99.99',
      period: 'per year',
      features: [
        'Everything in Premium',
        'Save 17% annually',
        'HD & 4K quality',
        'No ads',
        'Download for offline',
        'Priority support',
      ],
      priceId: isAnnualPriceValid ? annualPriceId : null,
      popular: false,
    },
  ];

  const isStripeConfigured = !!stripeKey && !isPlaceholderKey;

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-gray-400 text-lg">
              Unlock unlimited anime streaming with premium features
            </p>
          </div>

          {!isStripeConfigured && (
            <div className="mb-8 bg-yellow-900/30 border border-yellow-700 rounded-lg p-6">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Stripe Not Configured</h3>
              <p className="text-gray-300 mb-4">
                To enable payments, you need to set up Stripe. Follow the quick setup guide:
              </p>
              <div className="text-sm text-gray-400 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">1.</span>
                  <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline">
                    Create a Stripe account
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">2.</span>
                  <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline">
                    Get your API keys (Test mode)
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">3.</span>
                  <span>Run: <code className="bg-gray-800 px-2 py-1 rounded text-xs">npm run setup-stripe</code></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">4.</span>
                  <span>Or manually create <code className="bg-gray-800 px-1 rounded text-xs">.env.local</code> (see SETUP_STRIPE_NOW.md)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">5.</span>
                  <span>Restart your dev server</span>
                </div>
              </div>
            </div>
          )}

          {isStripeConfigured && (!isMonthlyPriceValid || !isAnnualPriceValid) && (
            <div className="mb-8 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
              <h3 className="text-blue-400 font-semibold mb-2">
                {isMonthlyProductId || isAnnualProductId ? '⚠️ Product IDs Detected' : '📝 Price IDs Required'}
              </h3>
              <p className="text-gray-300 mb-4">
                {isMonthlyProductId || isAnnualProductId 
                  ? 'You have Product IDs in your .env.local file, but you need Price IDs instead. Product IDs start with "prod_" but Price IDs start with "price_".'
                  : 'Your Stripe keys are configured, but you need to add Price IDs for the subscription plans.'}
              </p>
              <div className="text-sm text-gray-400 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">1.</span>
                  <a href="https://dashboard.stripe.com/test/products" target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline">
                    Go to Stripe Products Dashboard
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">2.</span>
                  <span>Click on your existing products (or create new ones if needed)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">3.</span>
                  <span>In each product, find the <strong>Price</strong> section and copy the <strong>Price ID</strong></span>
                </div>
                <div className="ml-6 bg-yellow-900/30 border border-yellow-700 p-2 rounded text-xs my-2">
                  <strong>Important:</strong> Price IDs start with <code className="bg-gray-800 px-1 rounded">price_</code>, not <code className="bg-gray-800 px-1 rounded">prod_</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red">4.</span>
                  <span>Update <code className="bg-gray-800 px-1 rounded">.env.local</code> with Price IDs:</span>
                </div>
                <div className="ml-6 bg-gray-900 p-3 rounded text-xs font-mono">
                  <div>NEXT_PUBLIC_STRIPE_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID</div>
                  <div>NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_YOUR_ANNUAL_PRICE_ID</div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-netflix-red">5.</span>
                  <span>Restart your dev server</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-gray-900 rounded-lg p-8 ${
                  plan.popular ? 'border-2 border-netflix-red' : 'border border-gray-700'
                }`}
                onClick={(e) => {
                  // Prevent clicks on the card from triggering button clicks
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    e.stopPropagation();
                  }
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-netflix-red text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <FiStar size={14} />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.priceId ? (
                  <button
                    type="button"
                    id={`subscribe-btn-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleSubscribe(plan.priceId!, e);
                    }}
                    disabled={loading || !isStripeConfigured}
                    className={`w-full py-3 rounded font-semibold transition ${
                      !isStripeConfigured
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-netflix-red text-white hover:bg-opacity-80'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {!isStripeConfigured 
                      ? 'Configure Stripe First' 
                      : loading 
                      ? 'Processing...' 
                      : 'Subscribe Now'}
                  </button>
                ) : plan.name === 'Basic' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded font-semibold bg-gray-800 text-gray-500 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded font-semibold bg-gray-800 text-gray-500 cursor-not-allowed"
                    title="Please add Price ID to .env.local"
                  >
                    Price ID Required
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-400">
            <p>All plans include a 7-day free trial. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

