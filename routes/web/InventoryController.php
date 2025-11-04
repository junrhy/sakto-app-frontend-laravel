<?php

use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Inventory Routes
|--------------------------------------------------------------------------
|
| Routes for inventory management including product management, stock
| tracking, and inventory operations.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Inventory Management
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/inventory/products', [InventoryController::class, 'getProducts']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::post('/inventory/bulk', [InventoryController::class, 'bulkDestroy']);
    Route::post('/inventory/bulk-operation', [InventoryController::class, 'bulkOperation']);
    Route::get('/inventory/export', [InventoryController::class, 'exportProducts']);
    Route::post('/inventory/import', [InventoryController::class, 'importProducts']);
    Route::get('/inventory/low-stock', [InventoryController::class, 'checkLowStock']);
    Route::get('/inventory/{id}/history', [InventoryController::class, 'getInventoryHistory']);
    Route::get('/inventory/{sku}/barcode', [InventoryController::class, 'generateBarcode']);
    Route::get('/inventory/products-overview', [InventoryController::class, 'getProductsOverview']);
    
    // Category Management
    Route::post('/inventory/categories', [InventoryController::class, 'storeCategory']);
    Route::put('/inventory/categories/{id}', [InventoryController::class, 'updateCategory']);
    Route::delete('/inventory/categories/{id}', [InventoryController::class, 'destroyCategory']);
    
    // Stock Management
    Route::post('/inventory/{id}/stock/add', [InventoryController::class, 'addStock']);
    Route::post('/inventory/{id}/stock/remove', [InventoryController::class, 'removeStock']);
    Route::post('/inventory/{id}/stock/adjust', [InventoryController::class, 'adjustStock']);
    Route::get('/inventory/{id}/stock/history', [InventoryController::class, 'getStockHistory']);
    
    // Low Stock Alerts
    Route::get('/inventory/low-stock-alerts', [InventoryController::class, 'getLowStockAlerts']);
    
    // Variant Management
    Route::get('/inventory/{id}/variants', [InventoryController::class, 'getVariants']);
    Route::post('/inventory/{id}/variants', [InventoryController::class, 'storeVariant']);
    Route::put('/inventory/{id}/variants/{variantId}', [InventoryController::class, 'updateVariant']);
    Route::delete('/inventory/{id}/variants/{variantId}', [InventoryController::class, 'destroyVariant']);
    
    // Discount Management
    Route::get('/inventory/discounts', [InventoryController::class, 'discounts'])->name('discounts');
    Route::get('/inventory/discounts/api', [InventoryController::class, 'getDiscounts']);
    Route::get('/inventory/discounts/active', [InventoryController::class, 'getActiveDiscounts']);
    Route::post('/inventory/discounts', [InventoryController::class, 'storeDiscount']);
    Route::put('/inventory/discounts/{id}', [InventoryController::class, 'updateDiscount']);
    Route::delete('/inventory/discounts/{id}', [InventoryController::class, 'destroyDiscount']);
    Route::post('/inventory/discounts/calculate', [InventoryController::class, 'calculateDiscount']);
});
