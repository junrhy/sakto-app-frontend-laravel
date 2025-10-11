<?php

use App\Http\Controllers\ConstructionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Construction Public Routes
|--------------------------------------------------------------------------
|
| Public routes for the Construction platform landing page.
|
*/

// Construction landing page
Route::get('/construction', [ConstructionController::class, 'index'])->name('construction.index');

