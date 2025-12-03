# Setup Guide - AnimeFlix with API & Payments

This guide will help you set up the anime streaming site with real API integration and Stripe payments.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Stripe

1. **Create a Stripe Account**
   - Go to https://stripe.com and create an account
   - Navigate to the Dashboard

2. **Get Your API Keys**
   - Go to Developers > API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Create Products and Prices**
   - Go to Products in the Stripe Dashboard
   - Click "Add product"
   - Create a product named "Premium Monthly" with price $9.99/month
   - Create another product named "Premium Annual" with price $99.99/year
   - Copy the Price IDs (start with `price_`)

4. **Set Up Webhooks** (for production)
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret (starts with `whsec_`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test Premium Subscription

1. Click "Premium" in the navbar or go to `/subscription`
2. Select a plan and click "Subscribe Now"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date, any CVC, any ZIP
5. Complete the checkout
6. You should be redirected to the success page and have premium access

## API Information

The site uses the **Consumet API** which provides:
- Anime search and listings
- Anime details and episodes
- Streaming links (iframe URLs and direct video sources)

The API is free and doesn't require authentication. It's available at:
- Base URL: `https://api.consumet.org/anime/gogoanime`

## Troubleshooting

### Videos not loading
- Check browser console for CORS errors
- Some video sources may be blocked by browser security
- Try different anime/episodes

### Stripe checkout not working
- Verify all environment variables are set correctly
- Check that price IDs match your Stripe dashboard
- Ensure you're using test mode keys (not live keys)

### Premium status not updating
- Check browser localStorage for `premium_status`
- Clear localStorage and try again
- Verify webhook is receiving events (in Stripe Dashboard)

## Production Deployment

1. **Update Environment Variables**
   - Use production Stripe keys
   - Update `NEXT_PUBLIC_BASE_URL` to your domain
   - Set up production webhook endpoint

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Deploy**
   - Deploy to Vercel, Netlify, or your preferred hosting
   - Add environment variables in your hosting platform
   - Set up the Stripe webhook endpoint

4. **Database Setup** (Recommended)
   - Replace localStorage with a database (PostgreSQL, MongoDB, etc.)
   - Store user subscriptions and watch history
   - Implement proper authentication

## Notes

- The Consumet API is a third-party service - availability may vary
- For production, consider implementing your own video hosting/CDN
- Add proper error handling and loading states
- Implement rate limiting for API calls
- Add analytics and monitoring

