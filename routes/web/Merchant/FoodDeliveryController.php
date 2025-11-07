<?php

use App\Http\Controllers\Merchant\FoodDelivery\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'merchant'])->group(function () {
    Route::get('/merchant/food-delivery/restaurant/dashboard', [RestaurantController::class, 'dashboard'])->name('merchant.food-delivery.restaurant.dashboard');
    Route::get('/merchant/food-delivery/restaurant/orders', [RestaurantController::class, 'orders'])->name('merchant.food-delivery.restaurant.orders');
    Route::get('/merchant/food-delivery/restaurant/menu', [RestaurantController::class, 'menu'])->name('merchant.food-delivery.restaurant.menu');
    Route::get('/merchant/food-delivery/restaurant/settings', [RestaurantController::class, 'settings'])->name('merchant.food-delivery.restaurant.settings');
    Route::get('/merchant/food-delivery/restaurant/{id}', [RestaurantController::class, 'restaurant'])->name('merchant.food-delivery.restaurant.show');
});
