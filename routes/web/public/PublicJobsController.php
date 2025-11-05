<?php

use App\Http\Controllers\PublicJobsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Jobs Routes
|--------------------------------------------------------------------------
|
| Public routes for job listings and applications (no authentication required).
|
*/

// Public job listings and applications
Route::get('/jobs/board/{slug}', [PublicJobsController::class, 'jobBoard'])->name('jobs.public.board');
Route::get('/jobs/{id}', [PublicJobsController::class, 'job'])->name('jobs.public.job');
Route::get('/jobs/{id}/apply', [PublicJobsController::class, 'apply'])->name('jobs.public.apply');
Route::post('/jobs/{id}/apply', [PublicJobsController::class, 'submitApplication'])->name('jobs.public.apply.submit');
Route::get('/jobs/{id}/apply/success', [PublicJobsController::class, 'applySuccess'])->name('jobs.public.apply.success');
