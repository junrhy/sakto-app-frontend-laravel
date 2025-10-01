<?php

use App\Http\Controllers\EventController;

/*
|--------------------------------------------------------------------------
| Event Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for event registration and public event access.
|
*/

// Public Event Registration Routes
Route::get('/events/{id}/public-register', [EventController::class, 'publicRegister'])->name('events.public-register');
Route::post('/events/{id}/public-register', [EventController::class, 'publicRegisterParticipant'])->name('events.public-register.store');
Route::get('/events/{id}/public', [EventController::class, 'publicShow'])->name('events.public-show');
