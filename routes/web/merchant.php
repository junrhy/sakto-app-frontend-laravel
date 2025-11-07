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

// Merchant Auth Routes
Route::get('/merchant/login', [App\Http\Controllers\Merchant\AuthController::class, 'showLoginForm'])->name('merchant.login');
Route::post('/merchant/login', [App\Http\Controllers\Merchant\AuthController::class, 'login'])->name('merchant.login.attempt');
Route::post('/merchant/logout', [App\Http\Controllers\Merchant\AuthController::class, 'logout'])->name('merchant.logout');

// Merchant Registration Routes
Route::get('/merchant/register', [App\Http\Controllers\Merchant\RegisteredMerchantController::class, 'create'])->name('merchant.register');
Route::post('/merchant/register', [App\Http\Controllers\Merchant\RegisteredMerchantController::class, 'store'])->name('merchant.register.store');

// Merchant Dashboard (requires authentication)
Route::middleware(['auth', 'merchant'])->group(function () {
    Route::get('/merchant/dashboard', [App\Http\Controllers\Merchant\DashboardController::class, 'index'])->name('merchant.dashboard');
});
