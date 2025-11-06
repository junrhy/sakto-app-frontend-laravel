<?php

use App\Http\Controllers\FoodDeliveryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Food Delivery Routes
|--------------------------------------------------------------------------
|
| Routes for food delivery functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Main pages
    Route::get('/food-delivery', [FoodDeliveryController::class, 'index'])->name('food-delivery.index');
    Route::get('/food-delivery/restaurant/{id}', [FoodDeliveryController::class, 'restaurant'])->name('food-delivery.restaurant');
    Route::get('/food-delivery/cart', [FoodDeliveryController::class, 'cart'])->name('food-delivery.cart');
    Route::get('/food-delivery/order/{id}', [FoodDeliveryController::class, 'order'])->name('food-delivery.order');
    Route::get('/food-delivery/orders', [FoodDeliveryController::class, 'orders'])->name('food-delivery.orders');

    // Restaurant Dashboard Routes
    Route::get('/food-delivery/restaurant/dashboard', [FoodDeliveryController::class, 'restaurantDashboard'])->name('food-delivery.restaurant.dashboard');
    Route::get('/food-delivery/restaurant/orders', [FoodDeliveryController::class, 'restaurantOrders'])->name('food-delivery.restaurant.orders');
    Route::get('/food-delivery/restaurant/menu', [FoodDeliveryController::class, 'restaurantMenu'])->name('food-delivery.restaurant.menu');
    Route::get('/food-delivery/restaurant/settings', [FoodDeliveryController::class, 'restaurantSettings'])->name('food-delivery.restaurant.settings');

    // Admin Dashboard Routes
    Route::get('/food-delivery/admin/restaurants', [FoodDeliveryController::class, 'adminRestaurants'])->name('food-delivery.admin.restaurants');
    Route::get('/food-delivery/admin/orders', [FoodDeliveryController::class, 'adminOrders'])->name('food-delivery.admin.orders');
    Route::get('/food-delivery/admin/drivers', [FoodDeliveryController::class, 'adminDrivers'])->name('food-delivery.admin.drivers');
    Route::get('/food-delivery/admin/menu', [FoodDeliveryController::class, 'adminMenu'])->name('food-delivery.admin.menu');
    Route::get('/food-delivery/admin/analytics', [FoodDeliveryController::class, 'adminAnalytics'])->name('food-delivery.admin.analytics');

    // Driver Dashboard Routes
    Route::get('/food-delivery/driver/dashboard', [FoodDeliveryController::class, 'driverDashboard'])->name('food-delivery.driver.dashboard');
    Route::get('/food-delivery/driver/orders', [FoodDeliveryController::class, 'driverOrders'])->name('food-delivery.driver.orders');

    // Proxy routes
    Route::get('/food-delivery/restaurants/list', [FoodDeliveryController::class, 'restaurantsList'])->name('food-delivery.restaurants.list');
    Route::get('/food-delivery/restaurant/{id}/show', [FoodDeliveryController::class, 'restaurantShow'])->name('food-delivery.restaurant.show');
    Route::get('/food-delivery/menu/items', [FoodDeliveryController::class, 'menuItems'])->name('food-delivery.menu.items');
    Route::get('/food-delivery/menu/categories', [FoodDeliveryController::class, 'menuCategories'])->name('food-delivery.menu.categories');
    Route::post('/food-delivery/orders', [FoodDeliveryController::class, 'storeOrder'])->name('food-delivery.orders.store');
    Route::get('/food-delivery/orders/list', [FoodDeliveryController::class, 'ordersList'])->name('food-delivery.orders.list');
    Route::put('/food-delivery/orders/{id}/update-status', [FoodDeliveryController::class, 'updateOrderStatus'])->name('food-delivery.orders.update-status');
    Route::post('/food-delivery/orders/{id}/assign-driver', [FoodDeliveryController::class, 'assignDriver'])->name('food-delivery.orders.assign-driver');
    Route::get('/food-delivery/drivers/list', [FoodDeliveryController::class, 'driversList'])->name('food-delivery.drivers.list');
    Route::get('/food-delivery/drivers/find-nearest', [FoodDeliveryController::class, 'findNearestDriver'])->name('food-delivery.drivers.find-nearest');
    Route::post('/food-delivery/payments/{orderId}/process', [FoodDeliveryController::class, 'processPayment'])->name('food-delivery.payments.process');
});

