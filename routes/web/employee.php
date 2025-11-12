<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
|
| Authentication and dashboard routes for employee users.
|
*/

// Employee authentication
Route::get('/employee/login', [App\Http\Controllers\Employee\AuthController::class, 'showLoginForm'])->name('employee.login');
Route::post('/employee/login', [App\Http\Controllers\Employee\AuthController::class, 'login'])->name('employee.login.attempt');
Route::post('/employee/logout', [App\Http\Controllers\Employee\AuthController::class, 'logout'])->name('employee.logout');

// Employee registration
Route::get('/employee/register', [App\Http\Controllers\Employee\RegisteredEmployeeController::class, 'create'])->name('employee.register');
Route::post('/employee/register', [App\Http\Controllers\Employee\RegisteredEmployeeController::class, 'store'])->name('employee.register.store');

// Protected employee routes
Route::middleware(['auth', 'employee', 'ensure_user_type:employee'])->group(function () {
    Route::get('/employee/dashboard', [App\Http\Controllers\Employee\DashboardController::class, 'index'])->name('employee.dashboard');
});

require __DIR__.'/Employee/FoodDeliveryController.php';
