<?php

use App\Http\Controllers\ClinicEmbedController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Clinic Embed Routes
|--------------------------------------------------------------------------
|
| Routes for embeddable clinic appointment forms and widgets.
|
*/

// Embeddable Appointment Form Routes (no authentication required)
Route::get('/embed/appointment/{identifier}', [ClinicEmbedController::class, 'showWidget'])->name('embed.appointment.widget');
Route::get('/embed/appointment/{identifier}/script', [ClinicEmbedController::class, 'generateEmbedScript'])->name('embed.appointment.script');
Route::get('/embed/appointment/{identifier}/widget.js', function($identifier) {
    return response()->file(public_path('embed/widget.js'));
})->name('embed.appointment.widget.js');

// Embed API Routes (public, no authentication required, with CORS)
Route::prefix('api/embed/appointment')->middleware('cors')->group(function () {
    Route::get('/clinic-info/{identifier}', [ClinicEmbedController::class, 'getClinicInfo']);
    Route::post('/book', [ClinicEmbedController::class, 'bookAppointment']);
});
