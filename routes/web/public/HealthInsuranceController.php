<?php

use App\Http\Controllers\HealthInsuranceController;

/*
|--------------------------------------------------------------------------
| Health Insurance Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for health insurance member access.
|
*/

// Health Insurance Public Routes
Route::get('/health-insurance/members/{id}/public', [HealthInsuranceController::class, 'showMember'])->name('health-insurance.members.show.public');
