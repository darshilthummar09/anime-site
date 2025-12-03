# How to Get Price IDs from Your Products

## ⚠️ Important: Product ID vs Price ID

You currently have **Product IDs** (`prod_...`) in your `.env.local` file, but you need **Price IDs** (`price_...`).

- **Product ID**: `prod_TV0C2Qp5DdKEr5` ❌ (This is what you have)
- **Price ID**: `price_1AbC123...` ✅ (This is what you need)

## Quick Steps to Get Price IDs:

### 1. Go to Your Products
1. Visit: **https://dashboard.stripe.com/test/products**
2. You should see your products: "Premium Monthly" and "Premium Annual"

### 2. Get Price ID from Each Product

**For Premium Monthly:**
1. Click on the "Premium Monthly" product
2. Scroll down to the **"Pricing"** section
3. You'll see a table with pricing information
4. Look for the **Price ID** column (it starts with `price_`)
5. Click the **copy icon** next to the Price ID
6. It will look like: `price_1AbC123...`

**For Premium Annual:**
1. Click on the "Premium Annual" product
2. Scroll down to the **"Pricing"** section
3. Copy the **Price ID** (starts with `price_`)

### 3. Update .env.local

Replace the Product IDs with Price IDs:

```env
# OLD (Product IDs - WRONG):
NEXT_PUBLIC_STRIPE_PRICE_ID=prod_TV0C2Qp5DdKEr5
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=prod_TV0DawlpSHgBYY

# NEW (Price IDs - CORRECT):
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1YOUR_ACTUAL_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_1YOUR_ACTUAL_ANNUAL_PRICE_ID
```

### 4. Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Visual Guide:

When you click on a product in Stripe Dashboard, you'll see:

```
Product Information
├── Name: Premium Monthly
├── Description: ...
└── Pricing
    └── Price Table
        ├── Price ID: price_1AbC123... ← COPY THIS!
        ├── Amount: $9.99
        └── Billing: Monthly
```

**Copy the Price ID, not the Product ID!**

## ✅ After Updating:

Once you add the correct Price IDs and restart your server:
- The "Price ID Required" message will disappear
- The subscription buttons will be enabled
- You can click "Subscribe Now" to test payments

