<?php

use App\Http\Controllers\MedicalController;

/*
|--------------------------------------------------------------------------
| Medical Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for medical/clinic functionality.
|
*/

// Medical/Clinic Public Routes
Route::get('/medical/clinic/{identifier}', [MedicalController::class, 'show'])->name('medical.clinic.show');
Route::post('/medical/clinic/{identifier}/book-appointment', [MedicalController::class, 'bookAppointment'])->name('medical.clinic.book-appointment');
