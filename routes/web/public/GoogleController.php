<?php

use App\Http\Controllers\Auth\GoogleController;

/*
|--------------------------------------------------------------------------
| Google Auth Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for Google authentication.
|
*/

// Google Auth Routes
Route::prefix('auth/google')->group(function () {
    Route::get('/redirect', [GoogleController::class, 'redirectToGoogle'])->name('auth.google.redirect');
    Route::get('/callback', [GoogleController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});
