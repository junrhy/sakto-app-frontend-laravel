# POS Variants and Discounts Integration Guide

## Overview

This document explains how **Product Variants** and **Discounts** are integrated into the Retail POS system.

## Current Implementation Status

### ✅ Completed
- **Backend API**: Variants and discounts endpoints are fully implemented
- **Management UI**: 
  - Variant management in Inventory page
  - Discount management in Discounts page
- **Database**: Tables created and migrations run

### ⚠️ Not Yet Integrated
- **POS Product Selection**: Variant selection dialog when adding products with variants
- **Discount Application**: Automatic discount calculation during checkout
- **Cart Display**: Showing variant information in cart items

---

## How Variants Work in POS

### Flow:
1. **Product Selection**: When a user clicks "Add to Cart" on a product that has variants
2. **Variant Dialog**: A dialog appears showing:
   - Base product option
   - All available variants (with attributes like Size: L, Color: Red)
   - Variant-specific pricing (if different from base)
   - Stock availability for each variant
3. **Selection**: User selects a variant (or base product)
4. **Add to Cart**: Product is added with variant information

### Example:
```
Product: "T-Shirt" (Base price: $20)
Variants:
  - Size: S, Color: Red → $20 (Stock: 10)
  - Size: M, Color: Red → $22 (Stock: 5)
  - Size: L, Color: Blue → $25 (Stock: 3)
```

When user clicks "Add to Cart" on "T-Shirt":
- Dialog shows: "Select Variant - T-Shirt"
- User can choose: Base Product, or any of the 3 variants
- Selected variant is added to cart with its specific price and stock

---

## How Discounts Work in POS

### Flow:
1. **Automatic Calculation**: When items are added to cart, system checks for applicable discounts
2. **Discount Matching**: System finds discounts that match:
   - Item ID or category
   - Minimum quantity requirements
   - Minimum purchase amount
   - Date range validity
   - Usage limits
3. **Best Discount Selection**: If multiple discounts apply, system selects the one with highest savings
4. **Cart Display**: Shows:
   - Original total
   - Discount amount (if any)
   - Final total after discount
5. **Checkout**: Discount is applied to final sale

### Discount Types:

1. **Percentage Discount** (e.g., 10% off)
   - Applied as percentage of item price
   
2. **Fixed Amount Discount** (e.g., $5 off)
   - Applied as fixed dollar amount
   
3. **Buy X Get Y** (e.g., Buy 2 Get 1 Free)
   - Calculates free items based on quantity

### Example:
```
Cart Items:
- Product A: $10 × 2 = $20
- Product B: $15 × 1 = $15
Subtotal: $35

Applicable Discounts:
- "Summer Sale": 10% off on Product A (if quantity ≥ 2)
- "Buy 2 Get 1": Buy 2 of Product B, get 1 free

System calculates:
- Discount 1: $20 × 10% = $2 off
- Discount 2: Get 1 free Product B = $15 off
- Best discount: Discount 2 ($15 savings)

Final Total: $35 - $15 = $20
```

---

## Implementation Steps

### Step 1: Fetch Variants When Loading Products

**Backend (PosRetailController.php)**:
```php
public function index()
{
    // ... existing code ...
    
    // Load variants for each product
    foreach ($products as &$product) {
        $variantsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/inventory/{$product['id']}/variants", [
                'client_identifier' => $clientIdentifier
            ]);
        
        $product['variants'] = $variantsResponse->successful() 
            ? ($variantsResponse->json()['data'] ?? [])
            : [];
    }
    
    return Inertia::render('PosRetail/Index', [
        'products' => $products,
        // ... other data ...
    ]);
}
```

### Step 2: Show Variant Dialog When Product Has Variants

**Frontend (PosRetail/Index.tsx)**:
```typescript
const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
const [productVariants, setProductVariants] = useState<any[]>([]);

const handleAddProductWithVariant = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
        // Show variant selector
        setSelectedProductForVariant(product);
        setProductVariants(product.variants);
        setIsVariantDialogOpen(true);
    } else {
        // No variants, add directly
        addItemToOrder(product);
    }
};

const handleVariantSelected = (variant: Variant | null) => {
    if (selectedProductForVariant) {
        const itemToAdd = variant 
            ? {
                ...selectedProductForVariant,
                id: variant.id, // Use variant ID
                price: variant.price || selectedProductForVariant.price,
                quantity: variant.quantity,
                variant_id: variant.id,
                variant_attributes: variant.attributes,
            }
            : selectedProductForVariant;
        
        addItemToOrder(itemToAdd);
    }
};
```

### Step 3: Fetch Active Discounts and Calculate

**Frontend (PosRetail/Index.tsx)**:
```typescript
const [activeDiscounts, setActiveDiscounts] = useState<any[]>([]);
const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
const [discountAmount, setDiscountAmount] = useState(0);

useEffect(() => {
    // Fetch active discounts
    fetch('/inventory/discounts/active', {
        headers: { 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            setActiveDiscounts(data.data || []);
        }
    });
}, []);

useEffect(() => {
    // Calculate discount when cart changes
    if (orderItems.length > 0) {
        calculateDiscount();
    } else {
        setAppliedDiscount(null);
        setDiscountAmount(0);
    }
}, [orderItems]);

const calculateDiscount = async () => {
    const subtotal = calculateTotal(orderItems);
    let bestDiscount = null;
    let maxDiscountAmount = 0;

    for (const item of orderItems) {
        for (const discount of activeDiscounts) {
            const response = await fetch('/inventory/discounts/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    item_id: item.id,
                    category_id: item.category_id,
                    quantity: item.quantity,
                    item_price: item.price,
                    purchase_amount: subtotal,
                }),
            });

            const data = await response.json();
            if (data.status === 'success' && data.data.discount_amount > maxDiscountAmount) {
                maxDiscountAmount = data.data.discount_amount;
                bestDiscount = data.data.discount;
            }
        }
    }

    setAppliedDiscount(bestDiscount);
    setDiscountAmount(maxDiscountAmount);
};
```

### Step 4: Update Cart Display with Discount

**Frontend (PosRetail/components/Cart.tsx)**:
```typescript
interface CartProps {
    // ... existing props ...
    discountAmount?: number;
    appliedDiscount?: any;
}

// In cart display:
<div className="space-y-2 border-t pt-2">
    <div className="flex justify-between text-sm">
        <span>Subtotal:</span>
        <span>{appCurrency.symbol}{subtotal.toFixed(2)}</span>
    </div>
    {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({appliedDiscount?.name}):</span>
            <span>-{appCurrency.symbol}{discountAmount.toFixed(2)}</span>
        </div>
    )}
    <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>{appCurrency.symbol}{(subtotal - discountAmount).toFixed(2)}</span>
    </div>
</div>
```

### Step 5: Include Discount in Sale Data

**Frontend (PosRetail/Index.tsx)**:
```typescript
const confirmCompleteSale = async (paymentData: {...}) => {
    const subtotal = calculateTotal(orderItems);
    const finalAmount = subtotal - discountAmount;

    const saleData = {
        items: orderItems.map((item) => ({
            id: item.id,
            variant_id: item.variant_id || null, // Include variant ID
            quantity: item.quantity,
            price: item.price,
        })),
        total_amount: finalAmount,
        discount_id: appliedDiscount?.id || null,
        discount_amount: discountAmount,
        // ... other fields ...
    };
    
    // ... rest of sale completion ...
};
```

---

## Summary

### Variants Integration:
1. ✅ Backend API ready
2. ✅ Management UI ready
3. ⚠️ **TODO**: Add variant selector dialog in POS
4. ⚠️ **TODO**: Include variant info in cart items
5. ⚠️ **TODO**: Pass variant data to sale completion

### Discounts Integration:
1. ✅ Backend API ready
2. ✅ Management UI ready
3. ⚠️ **TODO**: Fetch active discounts on POS load
4. ⚠️ **TODO**: Calculate discounts when cart changes
5. ⚠️ **TODO**: Display discount in cart
6. ⚠️ **TODO**: Include discount in sale data

---

## Next Steps

To fully integrate variants and discounts into POS:

1. **Update PosRetailController** to fetch variants with products
2. **Add VariantSelectorDialog** integration to PosRetail/Index.tsx
3. **Update Cart component** to show variant details
4. **Add discount calculation** logic to POS
5. **Update PaymentDialog** to show discount amount
6. **Update sale completion** to include variant and discount data

Would you like me to implement these integrations now?

