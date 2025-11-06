<?php

use App\Http\Controllers\FoodDeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Food Delivery Public Routes
|--------------------------------------------------------------------------
|
| Public routes for food delivery tracking.
|
*/

Route::get('/food-delivery/track/{reference?}', [FoodDeliveryController::class, 'track'])->name('food-delivery.track');
Route::get('/food-delivery/track-by-reference/{reference}', [FoodDeliveryController::class, 'getOrderByReference'])->name('food-delivery.track-by-reference');

