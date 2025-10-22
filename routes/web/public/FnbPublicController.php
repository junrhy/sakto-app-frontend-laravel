<?php

use App\Http\Controllers\FnbPublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FNB Public Routes
|--------------------------------------------------------------------------
|
| Public routes for F&B customer QR code ordering.
|
*/

// Public menu page for QR code ordering (no authentication required)
Route::get('/fnb/menu', [FnbPublicController::class, 'menu'])->name('fnb.public.menu');

// Submit customer order (proxied to backend API)
Route::post('/api/fnb-public/customer-order', [FnbPublicController::class, 'submitOrder'])->name('fnb.public.submit-order');

// Kitchen Display Routes (public)
Route::get('/fnb/kitchen-display/{clientIdentifier}', [App\Http\Controllers\PosRestaurantController::class, 'kitchenDisplay'])->name('pos-restaurant.kitchen-display');
Route::get('/fnb/customer-display/{clientIdentifier}', [App\Http\Controllers\PosRestaurantController::class, 'customerDisplay'])->name('pos-restaurant.customer-display');

// Kitchen Order Status Update (public)
Route::put('/fnb/kitchen-orders/{id}/status', [App\Http\Controllers\PosRestaurantController::class, 'updateKitchenOrderStatus'])->name('pos-restaurant.kitchen-orders.update-status');

