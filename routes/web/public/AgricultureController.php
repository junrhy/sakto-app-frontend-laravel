<?php

use App\Http\Controllers\AgricultureController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Agriculture Public Routes
|--------------------------------------------------------------------------
|
| Public routes for the Agriculture platform landing page.
|
*/

// Agriculture landing page
Route::get('/agriculture', [AgricultureController::class, 'index'])->name('agriculture.index');

