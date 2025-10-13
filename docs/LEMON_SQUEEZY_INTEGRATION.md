# Lemon Squeezy Payment Integration

This document outlines the complete Lemon Squeezy payment integration for the Sakto App subscription system.

## Overview

Lemon Squeezy has been integrated as a payment gateway option for subscription purchases. The integration uses the [official Lemon Squeezy Laravel package](https://github.com/lmsqueezy/laravel) and provides a seamless checkout experience with webhook support for subscription management.

## Important Note: API Limitations

**Lemon Squeezy API does not support creating or updating products/variants programmatically**. Products and variants must be created manually in the Lemon Squeezy dashboard, then their IDs can be linked in the application.

This integration focuses on:
- ✅ Using existing products/variants for checkout
- ✅ Webhook handling for payment processing
- ✅ Subscription management
- ❌ Automatic product/variant creation (not supported by API)

## What Was Implemented

### 1. Package Installation ✅
- Installed `lemonsqueezy/laravel` package via Composer
- Published configuration files and migrations
- Installed Lemon Squeezy database tables for customers, subscriptions, orders, and license keys

### 2. Model Updates ✅
- **User Model**: Added `Billable` trait to enable Lemon Squeezy functionality
- **UserSubscription Model**: Added Lemon Squeezy-specific fields:
  - `lemonsqueezy_checkout_id` - Stores the checkout session ID
  - `lemonsqueezy_subscription_id` - Stores the Lemon Squeezy subscription ID
  - `hasLemonSqueezySubscription()` - Helper method to check if subscription has Lemon Squeezy ID

### 3. Database Migrations ✅
- Created migration to add Lemon Squeezy fields to:
  - `user_subscriptions` table
  - `subscription_plans` table (added `lemon_squeezy_variant_id`)
- All Lemon Squeezy package migrations were run successfully

### 4. Payment Service ✅
Created `LemonSqueezyPaymentService` (`app/Services/LemonSqueezyPaymentService.php`) with methods:
- `createCheckout()` - Create one-time payment checkout
- `createSubscription()` - Create recurring subscription checkout
- `cancelSubscription()` - Cancel a subscription
- `resumeSubscription()` - Resume a paused subscription
- `generateReferenceNumber()` - Generate unique reference numbers

### 5. Controller Updates ✅
Updated `SubscriptionController` to handle Lemon Squeezy payments:
- Added `LemonSqueezyPaymentService` dependency injection
- Added Lemon Squeezy to payment methods array
- Created `handleLemonSqueezyPayment()` method
- Added `lemonSqueezySuccess()` callback for successful payments
- Added `lemonSqueezyCancel()` callback for cancelled payments
- Updated `cancel()` method to handle Lemon Squeezy subscription cancellations

### 6. Frontend Integration ✅
Updated `resources/js/Pages/Subscriptions/Index.tsx`:
- Added Lemon Squeezy as a selectable payment option
- Styled with proper hover and active states
- Positioned between Credits and Stripe payment options

### 7. Webhook Handling ✅
- Created `LemonSqueezyEventListener` (`app/Listeners/LemonSqueezyEventListener.php`)
- Registered event listeners in `AppServiceProvider`
- Handles the following webhook events:
  - `OrderCreated` - Logs order creation
  - `SubscriptionCreated` - Updates local subscription with Lemon Squeezy ID
  - `SubscriptionUpdated` - Syncs subscription status changes
  - `SubscriptionCancelled` - Marks subscription as cancelled
  - `SubscriptionExpired` - Marks subscription as expired
  - `SubscriptionPaymentSuccess` - Extends subscription and adds credits
  - `SubscriptionPaymentFailed` - Logs failed payments

### 8. Routes Configuration ✅
Updated `routes/web/SubscriptionController.php` with:
- Success redirect route: `/subscriptions/lemonsqueezy/success`
- Cancel redirect route: `/subscriptions/lemonsqueezy/cancel`
- Webhooks are automatically handled by the Lemon Squeezy package at `/lemon-squeezy/webhook`

### 9. Configuration ✅
Added Lemon Squeezy configuration to `config/services.php`:
```php
'lemon_squeezy' => [
    'api_key' => env('LEMON_SQUEEZY_API_KEY'),
    'store_id' => env('LEMON_SQUEEZY_STORE_ID'),
    'signing_secret' => env('LEMON_SQUEEZY_SIGNING_SECRET'),
    'environment' => env('LEMON_SQUEEZY_ENVIRONMENT', 'sandbox'),
],
```

## Configuration Steps

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_SIGNING_SECRET=your_signing_secret_here
LEMON_SQUEEZY_ENVIRONMENT=sandbox  # Change to 'production' for live
```

### 2. Get Your Credentials

1. **API Key**: 
   - Log in to your [Lemon Squeezy account](https://app.lemonsqueezy.com/)
   - Go to Settings → API
   - Create a new API key
   
2. **Store ID**:
   - In your Lemon Squeezy dashboard
   - Go to Settings → Stores
   - Copy your Store ID

3. **Signing Secret**:
   - Go to Settings → Webhooks
   - Create a new webhook pointing to: `https://yourdomain.com/lemon-squeezy/webhook`
   - Copy the signing secret

### 3. Set Up Products and Variants

**CRITICAL**: Products and variants must be created manually in Lemon Squeezy dashboard.

In your Lemon Squeezy dashboard:

1. **Create a product** (e.g., "Subscription Plans")
2. **Create variants** for each subscription plan:
   - Set the variant name (e.g., "Basic Plan - Monthly")
   - Set the price (e.g., $149.00)
   - Set interval (e.g., monthly, yearly)
   - Mark as subscription
3. **Copy the Variant ID** from the variant details
4. **Add to subscription plan** in Sakto App:
   - Go to Admin → Subscriptions
   - Create or edit a plan
   - Paste the Variant ID in the "Lemon Squeezy Variant ID" field
   - Save the plan

### 4. Configure Webhooks

In Lemon Squeezy dashboard (Settings → Webhooks):

1. **Webhook URL**: `https://yourdomain.com/lemon-squeezy/webhook`
2. **Enable these events**:
   - ✅ order_created
   - ✅ subscription_created
   - ✅ subscription_updated
   - ✅ subscription_cancelled
   - ✅ subscription_expired
   - ✅ subscription_payment_success
   - ✅ subscription_payment_failed

## How It Works

### Payment Flow

1. **User selects a plan** and chooses "Lemon Squeezy" as payment method
2. **System creates pending subscription** in local database
3. **User is redirected** to Lemon Squeezy checkout page
4. **User completes payment** on Lemon Squeezy
5. **User is redirected back** to success URL
6. **Subscription is activated** and credits are added
7. **Webhooks sync** subscription status in real-time

### Subscription Management

- **One-time payments**: Users pay once and get access for the plan duration
- **Recurring payments**: If auto_renew is enabled, Lemon Squeezy handles automatic renewals
- **Cancellations**: Users can cancel anytime, subscription remains active until period ends
- **Webhook sync**: All subscription changes are automatically synced via webhooks

### Credits System

- **Initial purchase**: Credits are added when subscription becomes active
- **Renewals**: Credits are added automatically on successful renewal payments
- **Failed payments**: Subscription remains active until expiration date

## Testing

### Test Mode

1. Set `LEMON_SQUEEZY_ENVIRONMENT=sandbox` in `.env`
2. Use Lemon Squeezy test mode
3. Use test credit cards provided by Lemon Squeezy

### Test Cards

Lemon Squeezy provides test cards for different scenarios. Check their [documentation](https://docs.lemonsqueezy.com/help/getting-started/test-mode) for details.

## Troubleshooting

### Issue: Checkout redirect fails

**Solution**: Ensure `lemon_squeezy_variant_id` is set for the subscription plan in the database.

### Issue: Webhooks not working

**Solution**: 
1. Verify webhook URL is publicly accessible
2. Check signing secret matches in `.env`
3. Review logs in `storage/logs/laravel.log`

### Issue: Subscription not activating

**Solution**:
1. Check if webhooks are properly configured
2. Verify `SubscriptionCreated` event is being received
3. Check local subscription status in database

## Additional Features

### License Keys

Lemon Squeezy also supports license key management. If needed, you can activate and validate license keys using:

```php
$user->activateLicenseKey('your-key', 'your-reference');
$user->validateLicenseKey('your-key', 'your-reference');
```

### Subscription Pausing

Users can pause and resume subscriptions:

```php
$user->subscription()->pause();
$user->subscription()->pauseForFree();
$user->subscription()->resume();
```

## Security Considerations

- ✅ Webhook signatures are automatically verified by the package
- ✅ API keys are stored in environment variables
- ✅ CSRF protection is disabled for webhook routes
- ✅ All payment processing happens on Lemon Squeezy's secure platform

## Resources

- [Lemon Squeezy Laravel Package](https://github.com/lmsqueezy/laravel)
- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com/)
- [Lemon Squeezy API Reference](https://docs.lemonsqueezy.com/api)
- [Test Mode Guide](https://docs.lemonsqueezy.com/help/getting-started/test-mode)

## Support

For issues specific to:
- **Integration**: Check this documentation and Laravel logs
- **Lemon Squeezy platform**: Contact [Lemon Squeezy Support](https://www.lemonsqueezy.com/help)
- **Package issues**: Open an issue on [GitHub](https://github.com/lmsqueezy/laravel/issues)

