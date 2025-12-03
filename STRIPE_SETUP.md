# Stripe Payment Setup Guide

Follow these steps to set up Stripe payments for your anime streaming site.

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" and create a free account
3. Complete the account setup

## Step 2: Get Your API Keys

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Navigate to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal" to see it

## Step 3: Create Products and Prices

1. In Stripe Dashboard, go to **Products**
2. Click **"+ Add product"**

### Create Monthly Premium Plan:
- **Name**: Premium Monthly
- **Description**: Monthly subscription for premium anime access
- **Pricing**: 
  - **Price**: $9.99
  - **Billing period**: Monthly
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

### Create Annual Premium Plan:
- **Name**: Premium Annual
- **Description**: Annual subscription for premium anime access
- **Pricing**:
  - **Price**: $99.99
  - **Billing period**: Yearly
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Stripe keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123...
   STRIPE_SECRET_KEY=sk_test_51XyZ789...
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_1AbC123...
   NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_1XyZ789...
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Important**: Never commit `.env.local` to git! It's already in `.gitignore`

## Step 5: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `/subscription` page
3. Click "Subscribe Now" on a premium plan
4. Use Stripe's test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., 12/34)
   - **CVC**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)

5. Complete the checkout - you should be redirected to `/subscription/success`

## Step 6: Set Up Webhooks (Optional, for Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Testing Different Scenarios

Stripe provides test cards for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

## Production Setup

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live** API keys (they start with `pk_live_` and `sk_live_`)
3. Update `.env.local` with live keys
4. Update `NEXT_PUBLIC_BASE_URL` to your production domain
5. Set up production webhook endpoint
6. Test with real card (use a small amount first!)

## Troubleshooting

### "Stripe is not configured" error
- Make sure `.env.local` exists and has the correct keys
- Restart your dev server after adding keys
- Check that keys start with `pk_test_` and `sk_test_`

### Checkout not working
- Verify price IDs are correct
- Check browser console for errors
- Make sure you're using test mode keys

### Webhook not receiving events
- Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use test keys for development
- ✅ Rotate keys if they're exposed
- ✅ Use environment variables in production
- ✅ Enable webhook signature verification

## Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Next.js + Stripe Guide](https://stripe.com/docs/payments/checkout)

