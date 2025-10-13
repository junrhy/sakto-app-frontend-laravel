# Lemon Squeezy Manual Setup Guide

## Overview

This guide explains how to manually set up Lemon Squeezy products and variants for both **Subscription Plans** and **Event Registrations**.

## Why Manual Setup?

**Lemon Squeezy API Limitation**: The API does not support creating or updating products/variants programmatically. Products can only be created through the dashboard.

Supported operations:
- ✅ List products and variants (GET)
- ✅ Retrieve specific product/variant (GET)
- ✅ Create checkouts for payments
- ✅ Manage subscriptions via webhooks
- ❌ Create products (POST) - NOT SUPPORTED
- ❌ Update products (PATCH) - NOT SUPPORTED
- ❌ Delete products (DELETE) - NOT SUPPORTED

## Setup Process

### Step 1: Access Lemon Squeezy Dashboard

1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
2. Log in to your account
3. Make sure you're in the correct store

### Step 2: Create Products

#### For Subscription Plans

1. Click **Products** in the sidebar
2. Click **Create Product**
3. Enter product details:
   - **Name**: "Subscription Plans" or "[Project Name] Subscriptions"
   - **Description**: "Subscription plans for [your app/service]"
   - **Status**: Published
4. Click **Save**
5. **Note the Product ID** (shown in the URL or product details)

#### For Event Registrations

1. Click **Products** in the sidebar
2. Click **Create Product**
3. Enter product details:
   - **Name**: "Event Registrations"
   - **Description**: "Registration fees for various events"
   - **Status**: Published
4. Click **Save**
5. **Note the Product ID** (shown in the URL or product details)

### Step 3: Create Variants

#### For Subscription Plans

For each subscription plan you want to offer:

1. Open the "Subscription Plans" product
2. Go to **Variants** section
3. Click **Add Variant**
4. Configure the variant:
   - **Name**: "Basic Plan - Monthly" (or your plan name)
   - **Description**: Plan description
   - **Price**: Set the price (e.g., $149.00)
   - **Billing Type**: Subscription
   - **Interval**: Select interval (day, week, month, year)
   - **Interval Count**: How many intervals (e.g., 1 for monthly, 12 for yearly)
5. Click **Save**
6. **Copy the Variant ID**

#### For Event Registrations

For each paid event:

1. Open the "Event Registrations" product
2. Go to **Variants** section
3. Click **Add Variant**
4. Configure the variant:
   - **Name**: "Tech Conference 2025 Registration" (your event name)
   - **Description**: Event description or details
   - **Price**: Set registration price (e.g., $50.00)
   - **Billing Type**: One-time
5. Click **Save**
6. **Copy the Variant ID**

### Step 4: Link IDs in Sakto App

#### For Subscription Plans

1. Go to **Admin → Subscriptions** in Sakto App
2. Create or edit a subscription plan
3. In the form, find "Lemon Squeezy Variant ID" field
4. **Paste the Variant ID** you copied
5. Save the plan

#### For Event Registrations

1. Create or edit an event in Sakto App
2. Go to the **Payment** tab
3. Enable **Paid Event** toggle
4. Find the Lemon Squeezy fields:
   - **Lemon Squeezy Product ID**: Paste the product ID
   - **Lemon Squeezy Variant ID**: Paste the variant ID
5. Save the event

## Finding IDs in Lemon Squeezy

### Product ID

**Method 1: From URL**
- Open the product
- Look at the URL: `https://app.lemonsqueezy.com/products/{PRODUCT_ID}`
- Copy the number

**Method 2: From Product Page**
- Open the product
- The ID is displayed in the product details section

### Variant ID

**Method 1: From URL**
- Open the variant
- Look at the URL: `https://app.lemonsqueezy.com/variants/{VARIANT_ID}`
- Copy the number

**Method 2: From Variant Details**
- Open the product
- Go to Variants section
- Click on the variant
- The ID is displayed in the variant details

**Method 3: Using CLI Command**
```bash
# List all products and their variants
php artisan lmsqueezy:products

# List variants for a specific product
php artisan lmsqueezy:products {PRODUCT_ID}
```

## Recommended Structure

### Option 1: Single Product, Multiple Variants (Recommended)

**For Subscriptions:**
- Product: "Subscription Plans"
  - Variant: "Basic Plan - Monthly" (ID: 123456)
  - Variant: "Premium Plan - Monthly" (ID: 123457)
  - Variant: "Basic Plan - Annual" (ID: 123458)

**For Events:**
- Product: "Event Registrations"
  - Variant: "Tech Conference 2025" (ID: 789012)
  - Variant: "Marketing Workshop" (ID: 789013)
  - Variant: "Developer Meetup" (ID: 789014)

**Benefits:**
- ✅ Cleaner dashboard
- ✅ Easier to manage
- ✅ Better organization
- ✅ Simpler reporting

### Option 2: Multiple Products

You can also create separate products for different categories:
- Product: "Community Subscriptions"
- Product: "Conference Registrations"
- Product: "Workshop Registrations"

Choose based on your organizational needs.

## Important Rules

### Immutability of IDs

Once set, Lemon Squeezy IDs **cannot be changed**:

- ✅ Can be set during creation
- ✅ Can be set once for existing records (e.g., converting free event to paid)
- ❌ Cannot be modified once set
- ❌ Cannot be removed once set

**Why?** The IDs are foreign keys to Lemon Squeezy's system. Changing them would break payment processing.

### Price Consistency

⚠️ **Important**: Prices must match between Sakto App and Lemon Squeezy:

**For Subscriptions:**
- Sakto App Plan Price: $149.00
- Lemon Squeezy Variant Price: $149.00

**For Events:**
- Sakto App Event Price: $50.00
- Lemon Squeezy Variant Price: $50.00

Mismatched prices will confuse users and may cause payment issues.

## Workflow Examples

### Example 1: Creating a New Subscription Plan

1. **In Lemon Squeezy Dashboard:**
   - Create variant "Premium Plan - Monthly" at $299/month
   - Copy variant ID: `456789`

2. **In Sakto App:**
   - Go to Admin → Subscriptions
   - Click "Create Plan"
   - Fill in plan details
   - Set price to $299.00
   - Paste variant ID: `456789`
   - Save

3. **Result:**
   - Users can now purchase this plan
   - Payments go through Lemon Squeezy
   - Webhooks activate subscriptions automatically

### Example 2: Creating a Paid Event

1. **In Lemon Squeezy Dashboard:**
   - Open "Event Registrations" product (or create if doesn't exist)
   - Add new variant "Developer Conference 2025"
   - Set as one-time payment at $150
   - Copy product ID: `111222` and variant ID: `333444`

2. **In Sakto App:**
   - Create new event
   - Fill in event details
   - Go to Payment tab
   - Enable "Paid Event"
   - Set price to $150.00
   - Paste product ID: `111222`
   - Paste variant ID: `333444`
   - Save

3. **Result:**
   - Event registration linked to Lemon Squeezy
   - Ready for payment processing (future implementation)

## Troubleshooting

### Issue: Where do I find my Store ID?

**Solution:**
1. Go to Lemon Squeezy Dashboard
2. Settings → Stores
3. Your Store ID is displayed (just the number, not including #)

### Issue: Can't find Product/Variant ID

**Solution:**
Use the CLI command:
```bash
php artisan lmsqueezy:products
```
This will list all products and their variants with IDs.

### Issue: Accidentally entered wrong ID

**Solution:**
- **For new records**: Edit and correct the ID before saving
- **For existing records**: IDs are immutable - contact support or create a new record

### Issue: Price mismatch between app and Lemon Squeezy

**Solution:**
1. Update the price in Lemon Squeezy dashboard (variant settings)
2. Update the price in Sakto App
3. Ensure both match exactly

## Environment Variables

Required in `.env` file:

```env
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE=your_store_id_here
LEMON_SQUEEZY_SIGNING_SECRET=your_signing_secret_here
```

## Testing

### Test in Sandbox Mode

Lemon Squeezy supports test mode for safe testing:

1. Use test API keys in `.env`
2. Create test products and variants
3. Test the full checkout flow
4. Verify webhooks are working
5. Check subscription activation

### Production Checklist

- [ ] Production API keys configured in `.env`
- [ ] Production products created in dashboard
- [ ] Variants created with correct pricing
- [ ] Variant IDs linked to subscription plans
- [ ] Variant IDs linked to paid events
- [ ] Webhooks configured and tested
- [ ] Test purchase completed successfully
- [ ] Webhook activation verified

## Additional Resources

- [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
- [Lemon Squeezy API Docs](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Laravel Package](https://github.com/lmsqueezy/laravel)
- [Creating Products Guide](https://docs.lemonsqueezy.com/help/products)
- [Creating Variants Guide](https://docs.lemonsqueezy.com/help/products/variants)

---

**Last Updated**: October 13, 2025  
**Approach**: Manual Setup (Due to API Limitations)  
**Status**: ✅ Production Ready

