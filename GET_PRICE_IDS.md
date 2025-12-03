# How to Get Stripe Price IDs

Your Stripe keys are configured! Now you just need to add the Price IDs.

## Quick Steps:

### 1. Create Products in Stripe (2 minutes)

1. Go to: **https://dashboard.stripe.com/test/products**
2. Click **"+ Add product"**

### 2. Create Monthly Plan

- **Name**: `Premium Monthly`
- **Description**: `Monthly subscription for premium anime access`
- **Pricing model**: `Standard pricing`
- **Price**: `9.99`
- **Currency**: `USD`
- **Billing period**: `Monthly`
- Click **"Save product"**
- **Copy the Price ID** (it looks like `price_1AbC123...`)

### 3. Create Annual Plan

- Click **"+ Add product"** again
- **Name**: `Premium Annual`
- **Description**: `Annual subscription for premium anime access`
- **Price**: `99.99`
- **Billing period**: `Yearly`
- Click **"Save product"**
- **Copy the Price ID** (it looks like `price_1XyZ789...`)

### 4. Update .env.local

Open your `.env.local` file and replace the placeholder price IDs:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SXzKB0XLjJwg0IYk8tIkczAga3USLdnGXS1PYJMdTnPa34Yc6JaeHUI4CXPzDShTKb9MXBO18smB6NYwrv3sXpU00zvuHdXDS
STRIPE_SECRET_KEY=sk_test_51SXzKB0XLjJwg0IYJP5aKrsefxESLSh5tu3YYPW8Da6OwonQP7waWvGdw4MOCMyFsgbInli8iU71R5zHP63qI5nR00Cn4x4SJm
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1YOUR_ACTUAL_MONTHLY_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_1YOUR_ACTUAL_ANNUAL_PRICE_ID_HERE
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 6. Test It! 🎉

1. Visit: http://localhost:3000/subscription
2. Buttons should now be enabled
3. Click "Subscribe Now"
4. Use test card: `4242 4242 4242 4242`

**Done!** Your subscription buttons will work now! ✅

