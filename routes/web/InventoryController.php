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
});
