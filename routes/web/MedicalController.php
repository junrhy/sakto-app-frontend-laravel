<?php

use App\Http\Controllers\MedicalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Medical Routes
|--------------------------------------------------------------------------
|
| Routes for medical/clinic public functionality including appointment booking.
|
*/

// Medical/Clinic Public Routes (no authentication required)
Route::get('/medical/clinic/{identifier}', [MedicalController::class, 'show'])->name('medical.clinic.show');
Route::post('/medical/clinic/{identifier}/book-appointment', [MedicalController::class, 'bookAppointment'])->name('medical.clinic.book-appointment');
