# 🚀 Set Up Stripe Payments - Step by Step

Follow these steps to enable Stripe payments on your site:

## Step 1: Create Stripe Account (2 minutes)

1. Go to **https://stripe.com**
2. Click **"Start now"** or **"Sign in"**
3. Create a free account (no credit card required for test mode)

## Step 2: Get Your API Keys (1 minute)

1. After logging in, you'll be in **Test mode** (see toggle in top right)
2. Go to: **https://dashboard.stripe.com/test/apikeys**
3. You'll see two keys:
   - **Publishable key** - Copy this (starts with `pk_test_`)
   - **Secret key** - Click **"Reveal"** and copy (starts with `sk_test_`)

## Step 3: Create Products (3 minutes)

1. Go to: **https://dashboard.stripe.com/test/products**
2. Click **"+ Add product"**

### Create Monthly Plan:
- **Name**: `Premium Monthly`
- **Description**: `Monthly subscription for premium anime access`
- **Pricing model**: `Standard pricing`
- **Price**: `9.99`
- **Currency**: `USD`
- **Billing period**: `Monthly`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_`)

### Create Annual Plan:
- Click **"+ Add product"** again
- **Name**: `Premium Annual`
- **Description**: `Annual subscription for premium anime access`
- **Price**: `99.99`
- **Billing period**: `Yearly`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_`)

## Step 4: Create .env.local File (1 minute)

**Option A: Use the setup script (Easiest)**
```bash
npm run setup-stripe
```
Follow the prompts and enter your keys.

**Option B: Manual setup**
1. Copy `env.local.template` to `.env.local`:
   ```bash
   cp env.local.template .env.local
   ```

2. Open `.env.local` in a text editor

3. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123YOUR_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_51XyZ789YOUR_KEY_HERE
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_1AbC123YOUR_MONTHLY_PRICE_ID
   NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_1XyZ789YOUR_ANNUAL_PRICE_ID
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## Step 5: Restart Your Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 6: Test It! 🎉

1. Visit: **http://localhost:3000/subscription**
2. You should see the subscription plans (no more error message!)
3. Click **"Subscribe Now"** on Premium plan
4. Use Stripe's test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
5. Click **"Pay"**
6. You'll be redirected to the success page! ✅

## ✅ You're Done!

Stripe payments are now working. You can:
- Accept test payments
- Test different scenarios (see Stripe docs for test cards)
- Switch to live mode when ready for production

## 🔍 Troubleshooting

**"Stripe is not configured" still showing?**
- Make sure `.env.local` exists in the root directory
- Check that keys start with `pk_test_` and `sk_test_`
- Restart your dev server after creating `.env.local`

**Checkout not working?**
- Verify price IDs are correct
- Check browser console for errors
- Make sure you're using test mode keys

**Need help?**
- See `STRIPE_SETUP.md` for detailed instructions
- Check Stripe docs: https://stripe.com/docs

## 🎯 Next Steps

- Test with different Stripe test cards
- Set up webhooks for production (see `STRIPE_SETUP.md`)
- Switch to live mode when ready

