<?php

use App\Http\Controllers\EducationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Education Public Routes
|--------------------------------------------------------------------------
|
| Public routes for the Education platform landing page.
|
*/

// Education landing page
Route::get('/education', [EducationController::class, 'index'])->name('education.index');

