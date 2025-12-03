# Quick Stripe Setup (5 minutes)

## Fast Setup Steps:

### 1. Get Stripe Test Keys (2 minutes)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (pk_test_...)
3. Click "Reveal" and copy your **Secret key** (sk_test_...)

### 2. Create Products (2 minutes)
1. Go to: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Create **Premium Monthly**:
   - Name: Premium Monthly
   - Price: $9.99/month
   - Copy the Price ID (price_...)
4. Create **Premium Annual**:
   - Name: Premium Annual  
   - Price: $99.99/year
   - Copy the Price ID (price_...)

### 3. Create .env.local File (1 minute)
Create a file named `.env.local` in the root directory:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_YOUR_ANNUAL_PRICE_ID
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Restart Server
```bash
npm run dev
```

### 5. Test It!
1. Visit: http://localhost:3000/subscription
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date, any CVC, any ZIP

**Done!** 🎉

For detailed instructions, see `STRIPE_SETUP.md`

