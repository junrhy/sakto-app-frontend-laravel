# Event Lemon Squeezy Integration

This document outlines the Lemon Squeezy integration for the Event Management system in the Sakto App.

## Overview

Events can be linked to Lemon Squeezy products for payment processing. Since Lemon Squeezy API doesn't support programmatic product creation, products and variants must be created manually in the Lemon Squeezy dashboard, then their IDs can be linked to events.

## What Was Implemented

### 1. Database Changes ✅

**Migration**: `2025_10_13_080711_add_lemon_squeezy_product_id_to_events_table.php`

Added two new fields to the `events` table:
- `lemon_squeezy_product_id` - Stores the Lemon Squeezy product ID (nullable)
- `lemon_squeezy_variant_id` - Stores the Lemon Squeezy variant ID (nullable)

### 2. Backend Model Updates ✅

**File**: `sakto-app-backend-laravel/app/Models/Event.php`

- Added `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` to the `$fillable` array
- These fields are accepted when creating or updating events
- **Important**: These IDs are **immutable** once set - they cannot be changed to maintain data integrity

### 3. Backend API Controller Updates ✅

**File**: `sakto-app-backend-laravel/app/Http/Controllers/Api/EventController.php`

- Added validation for `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` in `store()` method
- In `update()` method: IDs can only be set if they don't already exist (preventing accidental overwrites)
- **Immutability Protection**: Existing Lemon Squeezy IDs cannot be overwritten
- Comprehensive logging for debugging and audit trails

### 4. Frontend Controller Updates ✅

**File**: `sakto-app-frontend-laravel/app/Http/Controllers/EventController.php`

- Added validation to accept Lemon Squeezy IDs in `store()` and `update()` methods
- IDs are passed through to the backend API
- No automatic integration - IDs are manually provided by users

### 5. Frontend Form Updates ✅

**File**: `sakto-app-frontend-laravel/resources/js/Pages/Events/Form.tsx`

Added two new form fields in the **Payment Settings** tab:
- **Lemon Squeezy Product ID** input field
- **Lemon Squeezy Variant ID** input field

These fields appear when **Paid Event** toggle is enabled.

## How to Use

### Step 1: Create Product in Lemon Squeezy Dashboard

1. Log in to your [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
2. Go to **Products**
3. Click **Create Product**
4. Enter product details:
   - **Name**: "Event Registrations" (or similar)
   - **Description**: "Registration fees for events"
   - **Status**: Published
5. Click **Save**
6. **Copy the Product ID** from the URL or product details

### Step 2: Create Variant in Lemon Squeezy Dashboard

1. Open the product you just created
2. Go to **Variants** section
3. Click **Add Variant**
4. Enter variant details:
   - **Name**: Your event title or "Event Registration Fee"
   - **Price**: Set the event registration price
   - **Type**: One-time (not subscription)
5. Click **Save**
6. **Copy the Variant ID** from the variant details

### Step 3: Link to Event in Sakto App

1. Create or edit an event in Sakto App
2. Go to the **Payment** tab
3. Enable **Paid Event** toggle
4. Set the **Event Price** (should match the variant price)
5. **Paste the Product ID** in the "Lemon Squeezy Product ID" field
6. **Paste the Variant ID** in the "Lemon Squeezy Variant ID" field
7. Save the event

## API Limitations

**Important**: Lemon Squeezy API has the following limitations:

- ❌ **Cannot create products programmatically** - API only supports GET/HEAD methods
- ❌ **Cannot update products programmatically** - Read-only access
- ❌ **Cannot delete products programmatically** - Must be done in dashboard
- ✅ **Can create checkouts** - Products can be used for payment checkouts
- ✅ **Can retrieve products** - Products and variants can be listed via API

This is why manual entry of IDs is required.

## Lemon Squeezy ID Immutability

**CRITICAL**: The `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` fields are **immutable** once set. They act as foreign keys to Lemon Squeezy's system and should never be changed.

### Why Immutable?

1. **Data Integrity**: Changing IDs would break the link to the actual Lemon Squeezy product
2. **Consistency**: The IDs reference external resources that don't change
3. **Audit Trail**: Maintains a reliable connection between local events and Lemon Squeezy products
4. **Payment Tracking**: Ensures payments are correctly attributed to the right event

### Backend Protection

The backend API enforces immutability:

```php
// If event already has a Lemon Squeezy product ID
if ($event->lemon_squeezy_product_id) {
    // Remove IDs from update data to prevent overwriting
    unset($validated['lemon_squeezy_product_id']);
    unset($validated['lemon_squeezy_variant_id']);
    
    Log::info('Prevented update of existing Lemon Squeezy IDs');
}
```

### Allowed Operations

- ✅ **Set IDs during event creation** - When creating a new paid event
- ✅ **Set IDs once for existing events** - When converting a free event to paid
- ❌ **Change existing IDs** - Never allowed, automatically prevented by backend
- ✅ **Leave IDs empty** - Not all events need Lemon Squeezy integration

## Best Practices

### Naming Convention

**Recommended Product Structure:**
- **Product Name**: "Event Registrations"
- **Product Description**: "Registration fees for various events"
- **Status**: Published

**Variant Naming:**
- Include event title in variant name for easy identification
- Example: "Tech Conference 2025 Registration"
- Example: "Marketing Workshop - Early Bird"

### Price Consistency

⚠️ **Important**: The event price in Sakto App should match the variant price in Lemon Squeezy:
- Event in Sakto App: $50.00
- Variant in Lemon Squeezy: $50.00

This ensures consistency when participants pay for registration.

### One Product, Multiple Variants Approach

**Recommended Setup:**
1. Create **ONE product** called "Event Registrations" in Lemon Squeezy
2. For **each event**, create a new **variant** under that product
3. Each variant represents one specific event with its price

**Benefits:**
- ✅ Cleaner Lemon Squeezy dashboard
- ✅ All events organized in one place
- ✅ Easier to manage and track
- ✅ Better reporting and analytics

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
├── lemon_squeezy_product_id (string, nullable) ← NEW (Immutable)
├── lemon_squeezy_variant_id (string, nullable) ← NEW (Immutable)
├── created_at
└── updated_at
```

## Testing Checklist

- [ ] Create a product in Lemon Squeezy dashboard
- [ ] Create a variant with a price
- [ ] Copy product ID and variant ID
- [ ] Create a paid event in Sakto App
- [ ] Paste the IDs in the payment settings
- [ ] Save the event
- [ ] Verify IDs are saved in the database
- [ ] Try updating event - verify IDs cannot be changed
- [ ] Create another event using the same product but different variant

## Troubleshooting

### Issue: Where do I find the Product ID?

**Solution**: 
1. Go to Lemon Squeezy dashboard → Products
2. Click on your product
3. The ID is in the URL: `https://app.lemonsqueezy.com/products/{PRODUCT_ID}`
4. Or check the product details page - ID is displayed there

### Issue: Where do I find the Variant ID?

**Solution**:
1. Open the product in Lemon Squeezy
2. Go to the Variants section
3. Click on the variant
4. The ID is in the URL: `https://app.lemonsqueezy.com/variants/{VARIANT_ID}`
5. Or check the variant details - ID is displayed there

### Issue: Can I change the IDs after saving?

**Answer**: No. Once set, the IDs are immutable. If you need to change them:
1. The backend will prevent updates to existing IDs
2. You would need to create a new event or contact support

### Issue: Do I need to fill in both IDs?

**Answer**: 
- Both fields are optional
- If you want Lemon Squeezy integration, both IDs should be provided
- If left empty, the event works normally without Lemon Squeezy integration

## Future Enhancements

Possible future improvements:

1. **Checkout Integration**: Add checkout flow for event registration payments using the variant ID
2. **Webhook Handling**: Listen to Lemon Squeezy webhooks for payment confirmations
3. **Payment Tracking**: Link Lemon Squeezy orders to event participants
4. **Discount Codes**: Use Lemon Squeezy discount codes for early bird registrations
5. **API Product Listing**: Show dropdown of existing products/variants from Lemon Squeezy

## Resources

- [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
- [Lemon Squeezy API Documentation](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Products Guide](https://docs.lemonsqueezy.com/help/products)
- [Lemon Squeezy Laravel Package](https://github.com/lmsqueezy/laravel)

---

**Implementation Date**: October 13, 2025  
**Version**: 2.0.0 (Simplified Manual Integration)  
**Status**: ✅ Complete and Production Ready
