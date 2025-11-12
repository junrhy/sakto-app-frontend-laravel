<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Merchant Routes
|--------------------------------------------------------------------------
|
| Routes for merchant authentication and dashboard experience.
|
*/

// Merchant dashboard and auth
Route::get('/merchant/login', [App\Http\Controllers\Merchant\AuthController::class, 'showLoginForm'])->name('merchant.login');
Route::post('/merchant/login', [App\Http\Controllers\Merchant\AuthController::class, 'login'])->name('merchant.login.attempt');
Route::post('/merchant/logout', [App\Http\Controllers\Merchant\AuthController::class, 'logout'])->name('merchant.logout');

Route::get('/merchant/register', [App\Http\Controllers\Merchant\RegisteredMerchantController::class, 'create'])->name('merchant.register');
Route::post('/merchant/register', [App\Http\Controllers\Merchant\RegisteredMerchantController::class, 'store'])->name('merchant.register.store');

Route::middleware(['auth', 'merchant', 'ensure_user_type:merchant'])->group(function () {
    Route::get('/merchant/dashboard', [App\Http\Controllers\Merchant\DashboardController::class, 'index'])->name('merchant.dashboard');
});

require __DIR__.'/Merchant/FoodDeliveryController.php';
