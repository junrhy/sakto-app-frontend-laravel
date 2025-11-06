<?php

use App\Http\Controllers\Customer\FoodDeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Food Delivery Customer Routes
|--------------------------------------------------------------------------
|
| Customer-facing routes for food delivery functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Customer pages
    Route::get('/food-delivery', [FoodDeliveryController::class, 'index'])->name('food-delivery.index');
    Route::get('/food-delivery/restaurant/{id}', [FoodDeliveryController::class, 'restaurant'])->name('food-delivery.restaurant');
    Route::get('/food-delivery/cart', [FoodDeliveryController::class, 'cart'])->name('food-delivery.cart');
    Route::get('/food-delivery/order/{id}', [FoodDeliveryController::class, 'order'])->name('food-delivery.order');
    Route::get('/food-delivery/orders', [FoodDeliveryController::class, 'orders'])->name('food-delivery.orders');

    // Customer proxy routes
    Route::get('/food-delivery/restaurants/{id}', [FoodDeliveryController::class, 'restaurantShow'])->name('food-delivery.restaurants.show');
    Route::post('/food-delivery/orders', [FoodDeliveryController::class, 'storeOrder'])->name('food-delivery.orders.store');
});

