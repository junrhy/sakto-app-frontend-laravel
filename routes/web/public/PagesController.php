<?php

use App\Http\Controllers\PagesController;

/*
|--------------------------------------------------------------------------
| Pages Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for page access and public page functionality.
|
*/

// Pages
Route::get('/link/{slug}', [PagesController::class, 'getPage'])->name('pages.public');
Route::get('/api/pages/{slug}', [PagesController::class, 'getPageBySlug'])->name('api.pages.get-by-slug');
