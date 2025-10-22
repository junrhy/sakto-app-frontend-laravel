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

