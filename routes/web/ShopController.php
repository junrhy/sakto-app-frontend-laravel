<?php

use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Shop Routes
|--------------------------------------------------------------------------
|
| Routes for shop management and public shop pages.
|
*/

// Public shop routes (no authentication required)
Route::get('/shop/{identifier}', [ShopController::class, 'show'])->name('shop.show');
