<?php

use App\Http\Controllers\Employee\FoodDelivery\DriverController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'employee'])->group(function () {
    Route::get('/employee/food-delivery/driver/dashboard', [DriverController::class, 'dashboard'])->name('employee.food-delivery.driver.dashboard');
    Route::get('/employee/food-delivery/driver/orders', [DriverController::class, 'orders'])->name('employee.food-delivery.driver.orders');
});
