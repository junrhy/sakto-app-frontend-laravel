<?php

use App\Http\Controllers\ProductOrderController;

/*
|--------------------------------------------------------------------------
| Product Order Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for product order checkout and public order functionality.
|
*/

// Public Checkout Routes (for member marketplace)
Route::post('/member/checkout', [ProductOrderController::class, 'publicStore'])->name('member.public-checkout.store');
Route::get('/member/checkout/success', [ProductOrderController::class, 'publicCheckoutSuccess'])->name('member.public-checkout.success');
