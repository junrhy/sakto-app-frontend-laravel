<?php

use App\Http\Controllers\PosRestaurantPublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| POS Restaurant Public Routes
|--------------------------------------------------------------------------
|
| Public routes for POS Restaurant reservations.
|
*/

// Public reservation page (no authentication required)
Route::get('/pos-restaurant/reservation', [PosRestaurantPublicController::class, 'reservation'])->name('pos-restaurant.public.reservation');

// Submit public reservation (proxied to backend API)
Route::post('/api/pos-restaurant-public/reservation', [PosRestaurantPublicController::class, 'submitReservation'])->name('pos-restaurant.public.submit-reservation');

// Public reservation confirmation page (no authentication required)
Route::get('/pos-restaurant/reservation/confirm/{token}', [PosRestaurantPublicController::class, 'confirmReservation'])->name('pos-restaurant.public.confirm-reservation');
