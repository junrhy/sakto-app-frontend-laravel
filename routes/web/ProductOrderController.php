<?php

use App\Http\Controllers\ProductOrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Product Order Routes
|--------------------------------------------------------------------------
|
| Routes for product order management including order creation, processing,
| and order status management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Product Orders (subscription required)
    Route::prefix('product-orders')->group(function () {
        Route::get('/', [ProductOrderController::class, 'index'])->name('product-orders.index');
        Route::get('/checkout', [ProductOrderController::class, 'checkout'])->name('product-orders.checkout');
        Route::post('/', [ProductOrderController::class, 'store'])->name('product-orders.store');
        Route::get('/statistics', [ProductOrderController::class, 'statistics'])->name('product-orders.statistics');
        Route::get('/list', [ProductOrderController::class, 'getOrders'])->name('product-orders.list');
        Route::get('/recent', [ProductOrderController::class, 'getRecentOrders'])->name('product-orders.recent');
        Route::get('/{id}', [ProductOrderController::class, 'show'])->name('product-orders.show');
        Route::get('/{id}/edit', [ProductOrderController::class, 'edit'])->name('product-orders.edit');
        Route::put('/{id}', [ProductOrderController::class, 'update'])->name('product-orders.update');
        Route::delete('/{id}', [ProductOrderController::class, 'destroy'])->name('product-orders.destroy');
        Route::post('/{id}/process-payment', [ProductOrderController::class, 'processPayment'])->name('product-orders.process-payment');
        Route::patch('/{orderId}/items/{productId}/status', [ProductOrderController::class, 'updateItemStatus'])->name('product-orders.update-item-status');
    });
});
