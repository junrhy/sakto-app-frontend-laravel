# Event Lemon Squeezy Integration

This document outlines the complete Lemon Squeezy integration for the Event Management system in the Sakto App.

## Overview

Events with paid registration now automatically create, update, and delete products in Lemon Squeezy. This enables seamless payment processing for event registrations through Lemon Squeezy's payment gateway.

## What Was Implemented

### 1. Database Changes ✅

**Migration**: `2025_10_13_080711_add_lemon_squeezy_product_id_to_events_table.php`

Added two new fields to the `events` table:
- `lemon_squeezy_product_id` - Stores the Lemon Squeezy product ID
- `lemon_squeezy_variant_id` - Stores the Lemon Squeezy variant ID (for pricing)

### 2. Backend Model Updates ✅

**File**: `sakto-app-backend-laravel/app/Models/Event.php`

- Added `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` to the `$fillable` array
- These fields are now accepted when creating events
- **Important**: These IDs are **immutable** - once set, they cannot be changed to maintain data integrity

### 3. Backend API Controller Updates ✅

**File**: `sakto-app-backend-laravel/app/Http/Controllers/Api/EventController.php`

- Added validation for `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` in `store()` method
- In `update()` method: IDs can only be set if they don't already exist (for converting free events to paid)
- **Immutability Protection**: Existing Lemon Squeezy IDs cannot be overwritten, preventing accidental data corruption
- Comprehensive logging for debugging and audit trails

### 4. Frontend Service Extension ✅

**File**: `sakto-app-frontend-laravel/app/Services/LemonSqueezyPaymentService.php`

Extended the existing service with product management methods:

- `createEventProduct($data)` - Creates a new product in Lemon Squeezy for an event
- `createEventVariant($productId, $data)` - Creates a variant (pricing) for the product
- `updateEventProduct($productId, $data)` - Updates an existing event product
- `updateEventVariant($variantId, $data)` - Updates variant pricing
- `deleteEventProduct($productId)` - Deletes a product when event is deleted

### 5. Frontend Controller Integration ✅

**File**: `sakto-app-frontend-laravel/app/Http/Controllers/EventController.php`

Integrated Lemon Squeezy operations into the event lifecycle:

#### Create Event (`store` method)
- When creating a paid event, automatically creates a product in Lemon Squeezy
- Creates a variant with the event price
- Stores the `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` in the database
- Logs success or failure for debugging

#### Update Event (`update` method)
- For paid events with existing Lemon Squeezy products: updates the product details and price
- For paid events without Lemon Squeezy products: creates new product
- Handles both product and variant updates
- Maintains product ID consistency

#### Delete Event (`destroy` method)
- Before deleting an event, checks if it has a Lemon Squeezy product
- Deletes the product from Lemon Squeezy
- Deletes the event image from storage
- Removes the event from the database
- Logs the deletion process

## Lemon Squeezy ID Immutability

**CRITICAL**: The `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` fields are **immutable** once set. They act as foreign keys to Lemon Squeezy's system and should never be changed.

### Why Immutable?

1. **Data Integrity**: Changing IDs would break the link to the actual Lemon Squeezy product
2. **Consistency**: The IDs reference external resources that don't change
3. **Audit Trail**: Maintains a reliable connection between local events and Lemon Squeezy products

### Backend Protection

The backend API enforces immutability:

```php
// If event already has a Lemon Squeezy product ID
if ($event->lemon_squeezy_product_id) {
    // Remove IDs from update data to prevent overwriting
    unset($validated['lemon_squeezy_product_id']);
    unset($validated['lemon_squeezy_variant_id']);
}
```

### Allowed Operations

- ✅ **Set IDs during event creation** - When creating a new paid event
- ✅ **Set IDs once for existing events** - When converting a free event to paid
- ❌ **Change existing IDs** - Never allowed, automatically prevented by backend
- ✅ **Update product content** - Name, description, price, status can be updated via Lemon Squeezy API

## How It Works

### Event Creation Flow

1. **User creates a paid event** in the frontend form
2. **Frontend controller** validates the event data
3. **If event is paid and has a price > 0:**
   - Calls `LemonSqueezyPaymentService->createEventProduct()`
   - Sends product data to Lemon Squeezy API
   - Creates a product in Lemon Squeezy
   - Creates a variant with the event price
   - Receives product ID and variant ID
4. **Frontend controller** sends all event data (including Lemon Squeezy IDs) to backend API
5. **Backend API** stores the event with Lemon Squeezy IDs in the database
6. **Success!** Event is created with linked Lemon Squeezy product

### Event Update Flow

1. **User updates an event** in the frontend form
2. **Frontend controller** retrieves existing event data
3. **If event is paid and has a price > 0:**
   - **If Lemon Squeezy product exists:**
     - Calls `LemonSqueezyPaymentService->updateEventProduct()`
     - Updates product name, description, status in Lemon Squeezy
     - Updates variant price if changed
   - **If Lemon Squeezy product doesn't exist:**
     - Creates new product (same as creation flow)
4. **Frontend controller** sends updated data to backend API
5. **Backend API** updates the event in the database
6. **Success!** Event and Lemon Squeezy product are updated

### Event Deletion Flow

1. **User deletes an event**
2. **Frontend controller** retrieves event data
3. **If event has a Lemon Squeezy product:**
   - Calls `LemonSqueezyPaymentService->deleteEventProduct()`
   - Deletes the product from Lemon Squeezy
   - Logs the deletion result
4. **Frontend controller** deletes event image from storage
5. **Frontend controller** sends delete request to backend API
6. **Backend API** removes event from database
7. **Success!** Event and Lemon Squeezy product are deleted

## Configuration

### Prerequisites

Ensure the following environment variables are set in your frontend `.env` file:

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_SIGNING_SECRET=your_signing_secret_here
LEMON_SQUEEZY_ENVIRONMENT=sandbox  # Change to 'production' for live
```

### Get Your Credentials

1. **API Key**: 
   - Log in to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
   - Go to Settings → API
   - Create a new API key with permissions to manage products

2. **Store ID**:
   - In your Lemon Squeezy dashboard
   - Go to Settings → Stores
   - Copy your Store ID

3. **Signing Secret** (for webhooks):
   - Go to Settings → Webhooks
   - Create a webhook pointing to: `https://yourdomain.com/lemon-squeezy/webhook`
   - Copy the signing secret

## Product Structure in Lemon Squeezy

### Product
- **Name**: Event title
- **Description**: Event description
- **Status**: 
  - `draft` - if event status is draft or archived
  - `published` - if event status is published

### Variant
- **Name**: Event title (or "Event Registration")
- **Price**: Event price (converted to cents for Lemon Squeezy)
- **Currency**: Automatically handled by Lemon Squeezy based on account settings

## API Endpoints Used

All API calls to Lemon Squeezy use the base URL: `https://api.lemonsqueezy.com/v1`

### Create Product
```
POST /products
```

### Create Variant
```
POST /variants
```

### Update Product
```
PATCH /products/{product_id}
```

### Update Variant
```
PATCH /variants/{variant_id}
```

### Delete Product
```
DELETE /products/{product_id}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Failed Product Creation**: Logs warning but allows event creation to proceed
2. **Failed Product Update**: Logs warning but allows event update to proceed
3. **Failed Product Deletion**: Logs warning but allows event deletion to proceed
4. **API Errors**: All Lemon Squeezy API errors are logged with full context

This ensures that Lemon Squeezy issues don't block event management operations.

## Logging

All Lemon Squeezy operations are logged for debugging:

### Success Logs
```php
Log::info('Lemon Squeezy product created for event', [
    'product_id' => $productId,
    'variant_id' => $variantId,
]);
```

### Warning Logs
```php
Log::warning('Failed to create Lemon Squeezy product for event', [
    'error' => $errorMessage,
]);
```

### Error Logs
```php
Log::error('Lemon Squeezy event product creation failed', [
    'status' => $statusCode,
    'body' => $responseBody,
]);
```

Check logs at: `storage/logs/laravel.log`

## Testing

### Test in Sandbox Mode

1. Set `LEMON_SQUEEZY_ENVIRONMENT=sandbox` in `.env`
2. Create a test event with paid registration
3. Check Lemon Squeezy dashboard to verify product creation
4. Update the event and verify product update
5. Delete the event and verify product deletion

### Production Checklist

Before going live:

- [ ] Set `LEMON_SQUEEZY_ENVIRONMENT=production`
- [ ] Verify API credentials are for production store
- [ ] Test creating, updating, and deleting an event
- [ ] Verify products appear correctly in Lemon Squeezy dashboard
- [ ] Check webhook integration is working
- [ ] Monitor logs for any errors

## Troubleshooting

### Issue: Product not created in Lemon Squeezy

**Solutions**:
1. Verify `LEMON_SQUEEZY_API_KEY` is correct
2. Ensure `LEMON_SQUEEZY_STORE_ID` matches your store
3. Check API key has permission to create products
4. Review logs for specific error messages

### Issue: Product created but variant missing

**Solutions**:
1. Ensure event price is greater than 0
2. Check logs for variant creation errors
3. Verify API key has permission to create variants

### Issue: Product not updated when event changes

**Solutions**:
1. Verify event has `lemon_squeezy_product_id` stored
2. Check if product still exists in Lemon Squeezy
3. Review logs for update errors

### Issue: Product not deleted when event deleted

**Solutions**:
1. This is non-blocking - event will still delete
2. Check logs for deletion error details
3. Manually delete product in Lemon Squeezy dashboard if needed

## Future Enhancements

Possible future improvements:

1. **Checkout Integration**: Add checkout flow for event registration payments
2. **Webhook Handling**: Listen to Lemon Squeezy webhooks for payment confirmations
3. **Refund Support**: Implement refund flow for cancelled registrations
4. **Discount Codes**: Create discount codes for early bird registrations
5. **Payment Tracking**: Link Lemon Squeezy orders to event participants

## Database Schema

### Events Table (Updated)

```sql
events
├── id (primary key)
├── title
├── description
├── start_date
├── end_date
├── location
├── max_participants
├── registration_deadline
├── is_public (boolean)
├── is_paid_event (boolean)
├── event_price (decimal)
├── currency (string)
├── payment_instructions (text)
├── category
├── image
├── status
├── client_identifier
├── lemon_squeezy_product_id (string, nullable) ← NEW
├── lemon_squeezy_variant_id (string, nullable) ← NEW
├── created_at
└── updated_at
```

## Resources

- [Lemon Squeezy API Documentation](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Products API](https://docs.lemonsqueezy.com/api/products)
- [Lemon Squeezy Variants API](https://docs.lemonsqueezy.com/api/variants)
- [Lemon Squeezy Laravel Package](https://github.com/lmsqueezy/laravel)

## Support

For issues specific to:
- **Integration**: Check logs in `storage/logs/laravel.log`
- **Lemon Squeezy API**: Contact [Lemon Squeezy Support](https://www.lemonsqueezy.com/help)
- **Event Management**: Review EventController logic

---

**Implementation Date**: October 13, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete and Production Ready

