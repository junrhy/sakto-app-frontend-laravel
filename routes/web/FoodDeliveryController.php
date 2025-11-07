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
    // Admin Dashboard Routes
    // More specific routes must come first
    Route::get('/food-delivery/admin/restaurants/create', [FoodDeliveryController::class, 'adminRestaurantsCreate'])->name('food-delivery.admin.restaurants.create');
    Route::get('/food-delivery/admin/restaurants/{id}/edit', [FoodDeliveryController::class, 'adminRestaurantsEdit'])->name('food-delivery.admin.restaurants.edit');
    Route::get('/food-delivery/admin/restaurants', [FoodDeliveryController::class, 'adminRestaurants'])->name('food-delivery.admin.restaurants');
    Route::get('/food-delivery/admin/orders', [FoodDeliveryController::class, 'adminOrders'])->name('food-delivery.admin.orders');
    Route::get('/food-delivery/admin/drivers/create', [FoodDeliveryController::class, 'adminDriversCreate'])->name('food-delivery.admin.drivers.create');
    Route::get('/food-delivery/admin/drivers/{id}/edit', [FoodDeliveryController::class, 'adminDriversEdit'])->name('food-delivery.admin.drivers.edit');
    Route::get('/food-delivery/admin/drivers', [FoodDeliveryController::class, 'adminDrivers'])->name('food-delivery.admin.drivers');
    Route::get('/food-delivery/admin/menu', [FoodDeliveryController::class, 'adminMenu'])->name('food-delivery.admin.menu');
    Route::get('/food-delivery/admin/analytics', [FoodDeliveryController::class, 'adminAnalytics'])->name('food-delivery.admin.analytics');

    // Proxy routes (shared by admin, restaurant, driver)
    Route::get('/food-delivery/restaurants/list', [FoodDeliveryController::class, 'restaurantsList'])->name('food-delivery.restaurants.list');
    Route::post('/food-delivery/restaurants', [FoodDeliveryController::class, 'restaurantStore'])->name('food-delivery.restaurants.store');
    Route::put('/food-delivery/restaurants/{id}', [FoodDeliveryController::class, 'restaurantUpdate'])->name('food-delivery.restaurants.update');
    Route::delete('/food-delivery/restaurants/{id}', [FoodDeliveryController::class, 'restaurantDelete'])->name('food-delivery.restaurants.delete');
    Route::get('/food-delivery/menu/items', [FoodDeliveryController::class, 'menuItems'])->name('food-delivery.menu.items');
    Route::post('/food-delivery/menu/items', [FoodDeliveryController::class, 'menuItemStore'])->name('food-delivery.menu.items.store');
    Route::put('/food-delivery/menu/items/{id}', [FoodDeliveryController::class, 'menuItemUpdate'])->name('food-delivery.menu.items.update');
    Route::delete('/food-delivery/menu/items/{id}', [FoodDeliveryController::class, 'menuItemDelete'])->name('food-delivery.menu.items.delete');
    Route::get('/food-delivery/menu/categories', [FoodDeliveryController::class, 'menuCategories'])->name('food-delivery.menu.categories');
    Route::post('/food-delivery/menu/categories', [FoodDeliveryController::class, 'menuCategoryStore'])->name('food-delivery.menu.categories.store');
    Route::put('/food-delivery/menu/categories/{id}', [FoodDeliveryController::class, 'menuCategoryUpdate'])->name('food-delivery.menu.categories.update');
    Route::delete('/food-delivery/menu/categories/{id}', [FoodDeliveryController::class, 'menuCategoryDelete'])->name('food-delivery.menu.categories.delete');
    Route::get('/food-delivery/orders/list', [FoodDeliveryController::class, 'ordersList'])->name('food-delivery.orders.list');
    Route::put('/food-delivery/orders/{id}/update-status', [FoodDeliveryController::class, 'updateOrderStatus'])->name('food-delivery.orders.update-status');
    Route::post('/food-delivery/orders/{id}/assign-driver', [FoodDeliveryController::class, 'assignDriver'])->name('food-delivery.orders.assign-driver');
    Route::get('/food-delivery/drivers/list', [FoodDeliveryController::class, 'driversList'])->name('food-delivery.drivers.list');
    Route::get('/food-delivery/drivers/{id}', [FoodDeliveryController::class, 'driverShow'])->name('food-delivery.drivers.show');
    Route::post('/food-delivery/drivers', [FoodDeliveryController::class, 'driverStore'])->name('food-delivery.drivers.store');
    Route::put('/food-delivery/drivers/{id}', [FoodDeliveryController::class, 'driverUpdate'])->name('food-delivery.drivers.update');
    Route::delete('/food-delivery/drivers/{id}', [FoodDeliveryController::class, 'driverDelete'])->name('food-delivery.drivers.delete');
    Route::get('/food-delivery/drivers/find-nearest', [FoodDeliveryController::class, 'findNearestDriver'])->name('food-delivery.drivers.find-nearest');
    Route::post('/food-delivery/payments/{orderId}/process', [FoodDeliveryController::class, 'processPayment'])->name('food-delivery.payments.process');
});

