<?php

use App\Http\Controllers\ChallengeController;

/*
|--------------------------------------------------------------------------
| Challenge Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for challenge registration and public challenge access.
|
*/

// Public Challenge Registration Routes
Route::get('/challenges/{id}/public-register', [ChallengeController::class, 'publicRegister'])->name('challenges.public-register');
Route::post('/challenges/{id}/public-register', [ChallengeController::class, 'publicRegisterParticipant'])->name('challenges.public-register.store');
Route::get('/challenges/{id}/public', [ChallengeController::class, 'publicShow'])->name('challenges.public-show');
