<?php

use App\Http\Controllers\ContentCreatorController;

/*
|--------------------------------------------------------------------------
| Content Creator Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for content creator public access.
|
*/

// Public Content Creator Routes
Route::get('/post/{slug}', [ContentCreatorController::class, 'publicShow'])->name('content-creator.public');
