<?php

use App\Http\Controllers\ParcelDeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Parcel Delivery Public Routes
|--------------------------------------------------------------------------
|
| Public routes for parcel delivery tracking (no authentication required).
|
*/

// Public tracking route (no authentication required)
Route::get('/parcel-delivery/track/{reference?}', [ParcelDeliveryController::class, 'track'])->name('parcel-delivery.track');
Route::get('/parcel-delivery/track-by-reference/{reference}', [ParcelDeliveryController::class, 'getDeliveryByReference'])->name('parcel-delivery.track-by-reference');

