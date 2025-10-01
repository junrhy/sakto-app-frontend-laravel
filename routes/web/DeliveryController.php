<?php

use App\Http\Controllers\DeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Delivery Routes
|--------------------------------------------------------------------------
|
| Routes for delivery management and public delivery pages.
|
*/

// Public delivery routes (no authentication required)
Route::get('/delivery/{identifier}', [DeliveryController::class, 'show'])->name('delivery.show');
