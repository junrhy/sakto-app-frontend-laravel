<?php

use App\Http\Controllers\JobsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Jobs Routes
|--------------------------------------------------------------------------
|
| Routes for job management and public job pages.
|
*/

// Public jobs routes (no authentication required)
Route::get('/jobs/{identifier}', [JobsController::class, 'show'])->name('jobs.show');
