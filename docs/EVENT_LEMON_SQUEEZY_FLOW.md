# Event Lemon Squeezy Integration - Complete Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│                 (sakto-app-frontend-laravel)                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Uses
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   LemonSqueezyPaymentService                        │
│                                                                     │
│  • createEventProduct()    - Creates LS product                    │
│  • createEventVariant()    - Creates pricing variant               │
│  • updateEventProduct()    - Updates product details               │
│  • updateEventVariant()    - Updates pricing                       │
│  • deleteEventProduct()    - Deletes product                       │
└─────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
         ┌──────────┘                              └──────────┐
         │                                                    │
         │ API Calls                                          │ API Calls
         ▼                                                    ▼
┌──────────────────────┐                      ┌──────────────────────────┐
│   Lemon Squeezy      │                      │   Backend API            │
│   (External)         │                      │   (sakto-app-backend)    │
│                      │                      │                          │
│  • Product created   │                      │  • Event stored in DB    │
│  • Returns IDs       │                      │  • IDs saved (immutable) │
└──────────────────────┘                      └──────────────────────────┘
```

## Event Creation Flow (Paid Event)

```
┌────────────┐
│   USER     │  Creates paid event in form
└─────┬──────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController::store()                         │
│                                                            │
│ 1. Validate event data                                    │
│ 2. Upload image to storage                                │
│ 3. Check if is_paid_event && event_price > 0             │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ YES (Paid Event)
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::createEventProduct()          │
│                                                            │
│ POST https://api.lemonsqueezy.com/v1/products            │
│ {                                                          │
│   name: "Event Title",                                     │
│   description: "Event Description",                        │
│   status: "draft" or "published"                          │
│ }                                                          │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Returns product_id
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::createEventVariant()          │
│                                                            │
│ POST https://api.lemonsqueezy.com/v1/variants            │
│ {                                                          │
│   product_id: 12345,                                       │
│   name: "Event Registration",                             │
│   price: 5000  (cents)                                    │
│ }                                                          │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Returns variant_id
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController                                   │
│                                                            │
│ Add to validated data:                                     │
│   lemon_squeezy_product_id: "12345"                       │
│   lemon_squeezy_variant_id: "67890"                       │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ HTTP POST /api/events
      ▼
┌────────────────────────────────────────────────────────────┐
│ Backend EventController::store()                          │
│                                                            │
│ 1. Validate all fields (including LS IDs)                 │
│ 2. Event::create($validated)                              │
│ 3. Save to database with LS IDs                           │
│ 4. Log success                                            │
└─────┬──────────────────────────────────────────────────────┘
      │
      ▼
┌────────────┐
│  SUCCESS   │  Event created with Lemon Squeezy product linked
└────────────┘
```

## Event Update Flow (Existing Paid Event)

```
┌────────────┐
│   USER     │  Updates existing paid event
└─────┬──────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController::update()                        │
│                                                            │
│ 1. Get existing event data from backend                   │
│ 2. Check if event has lemon_squeezy_product_id            │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Has LS Product ID? YES
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::updateEventProduct()          │
│                                                            │
│ PATCH https://api.lemonsqueezy.com/v1/products/{id}      │
│ {                                                          │
│   name: "Updated Title",                                   │
│   description: "Updated Description",                      │
│   status: "published"                                     │
│ }                                                          │
└─────┬──────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::updateEventVariant()          │
│                                                            │
│ PATCH https://api.lemonsqueezy.com/v1/variants/{id}      │
│ {                                                          │
│   price: 7500  (cents)                                    │
│ }                                                          │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Product updated in Lemon Squeezy
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController                                   │
│                                                            │
│ Send update to backend (LS IDs included but ignored)      │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ HTTP PUT /api/events/{id}
      ▼
┌────────────────────────────────────────────────────────────┐
│ Backend EventController::update()                         │
│                                                            │
│ 1. Validate all fields                                     │
│ 2. Check if event has lemon_squeezy_product_id            │
│    → YES: Remove LS IDs from $validated (immutable)       │
│ 3. $event->update($validated)                             │
│ 4. Log that IDs were protected                            │
└─────┬──────────────────────────────────────────────────────┘
      │
      ▼
┌────────────┐
│  SUCCESS   │  Event updated, LS IDs unchanged, product content updated
└────────────┘
```

## Event Update Flow (Converting Free to Paid)

```
┌────────────┐
│   USER     │  Converts free event to paid event
└─────┬──────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController::update()                        │
│                                                            │
│ 1. Get existing event data from backend                   │
│ 2. Check if event has lemon_squeezy_product_id            │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Has LS Product ID? NO
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::createEventProduct()          │
│                                                            │
│ Create NEW product for existing event                     │
│ Returns: product_id and variant_id                        │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Product created in Lemon Squeezy
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController                                   │
│                                                            │
│ Add LS IDs to validated data (first time)                 │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ HTTP PUT /api/events/{id}
      ▼
┌────────────────────────────────────────────────────────────┐
│ Backend EventController::update()                         │
│                                                            │
│ 1. Validate all fields                                     │
│ 2. Check if event has lemon_squeezy_product_id            │
│    → NO: Allow setting IDs for the first time             │
│ 3. $event->update($validated)                             │
│ 4. Log that IDs were set                                  │
└─────┬──────────────────────────────────────────────────────┘
      │
      ▼
┌────────────┐
│  SUCCESS   │  Free event converted to paid, LS IDs saved
└────────────┘
```

## Event Deletion Flow

```
┌────────────┐
│   USER     │  Deletes event
└─────┬──────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController::destroy()                       │
│                                                            │
│ 1. Get event data from backend                            │
│ 2. Check if event has lemon_squeezy_product_id            │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Has LS Product ID? YES
      ▼
┌────────────────────────────────────────────────────────────┐
│ LemonSqueezyPaymentService::deleteEventProduct()          │
│                                                            │
│ DELETE https://api.lemonsqueezy.com/v1/products/{id}     │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ Product deleted from Lemon Squeezy
      ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend EventController                                   │
│                                                            │
│ 1. Delete event image from storage                        │
│ 2. Send delete request to backend                         │
└─────┬──────────────────────────────────────────────────────┘
      │
      │ HTTP DELETE /api/events/{id}
      ▼
┌────────────────────────────────────────────────────────────┐
│ Backend EventController::destroy()                        │
│                                                            │
│ 1. Find event                                              │
│ 2. Delete from database                                   │
│ 3. Return success                                          │
└─────┬──────────────────────────────────────────────────────┘
      │
      ▼
┌────────────┐
│  SUCCESS   │  Event and LS product both deleted
└────────────┘
```

## Data Flow - What Gets Saved Where

### Frontend Database (MySQL)
```
events table:
├── Standard event fields (title, description, dates, etc.)
├── lemon_squeezy_product_id  ← Link to Lemon Squeezy (IMMUTABLE)
└── lemon_squeezy_variant_id  ← Link to Lemon Squeezy (IMMUTABLE)
```

### Lemon Squeezy Platform
```
Product:
├── id (referenced by event.lemon_squeezy_product_id)
├── name (updated from event.title)
├── description (updated from event.description)
└── status (updated from event.status)

Variant:
├── id (referenced by event.lemon_squeezy_variant_id)
├── product_id (links to product)
├── name (event.title)
└── price (updated from event.event_price)
```

## Important Rules

### Immutability of IDs

**✅ ALLOWED:**
- Set `lemon_squeezy_product_id` during event creation
- Set `lemon_squeezy_product_id` once when converting free event to paid
- Update product content (name, description, price, status) in Lemon Squeezy

**❌ NEVER ALLOWED:**
- Change `lemon_squeezy_product_id` once it's set
- Change `lemon_squeezy_variant_id` once it's set
- These are protected by backend validation

### Product Content Updates

When you update an event:
- **Event title changes** → Updates product name in Lemon Squeezy ✅
- **Event description changes** → Updates product description in Lemon Squeezy ✅
- **Event price changes** → Updates variant price in Lemon Squeezy ✅
- **Event status changes** → Updates product status in Lemon Squeezy ✅
- **Product ID** → NEVER changes (immutable) ✅
- **Variant ID** → NEVER changes (immutable) ✅

## Error Handling Strategy

### Non-Blocking Failures

Lemon Squeezy operations are **non-blocking**:

```
If Lemon Squeezy API fails:
  ├── Log the error
  ├── Continue with event operation
  └── Event creation/update/deletion still succeeds
  
Why? 
  └── Event management shouldn't be blocked by payment gateway issues
```

### Recovery

If Lemon Squeezy operations fail:
1. **Manual fix**: Admin can manually create/update product in Lemon Squeezy dashboard
2. **Retry**: Update event again (if no product ID exists, it will try creating one)
3. **Logs**: All failures are logged for investigation

## Testing Checklist

- [ ] Create a paid event → Verify product appears in Lemon Squeezy dashboard
- [ ] Check database → Verify `lemon_squeezy_product_id` and `lemon_squeezy_variant_id` are saved
- [ ] Update event title → Verify product name updates in Lemon Squeezy
- [ ] Update event price → Verify variant price updates in Lemon Squeezy
- [ ] Update event status → Verify product status updates in Lemon Squeezy
- [ ] Try to manually change LS IDs → Verify backend prevents it
- [ ] Delete event → Verify product deleted from Lemon Squeezy
- [ ] Check logs → Verify all operations are logged correctly
- [ ] Test with free event → Verify no Lemon Squeezy calls are made
- [ ] Convert free to paid → Verify product is created and IDs are set

## Logging Output Examples

### Successful Creation
```
[2025-10-13 08:10:00] INFO: Lemon Squeezy product created for event
{
    "product_id": "123456",
    "variant_id": "789012"
}

[2025-10-13 08:10:01] INFO: Event created with Lemon Squeezy product
{
    "event_id": 45,
    "lemon_squeezy_product_id": "123456",
    "lemon_squeezy_variant_id": "789012"
}
```

### Successful Update
```
[2025-10-13 08:15:00] INFO: Lemon Squeezy product updated for event
{
    "event_id": 45,
    "product_id": "123456"
}

[2025-10-13 08:15:01] INFO: Prevented update of existing Lemon Squeezy IDs
{
    "event_id": 45,
    "existing_product_id": "123456"
}
```

### Converting Free to Paid
```
[2025-10-13 08:20:00] INFO: Lemon Squeezy product created for existing event
{
    "event_id": 45,
    "product_id": "123456"
}

[2025-10-13 08:20:01] INFO: Setting Lemon Squeezy IDs for existing event
{
    "event_id": 45,
    "lemon_squeezy_product_id": "123456",
    "lemon_squeezy_variant_id": "789012"
}
```

### Successful Deletion
```
[2025-10-13 08:25:00] INFO: Lemon Squeezy product deleted for event
{
    "event_id": 45,
    "product_id": "123456"
}
```

---

**Last Updated**: October 13, 2025  
**Status**: Production Ready

