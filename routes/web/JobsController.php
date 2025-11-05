<?php

use App\Http\Controllers\JobsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Jobs Routes
|--------------------------------------------------------------------------
|
| Routes for job management including job boards, jobs, applicants, and applications.
|
*/

// Authenticated routes
Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Job Boards Routes
    Route::prefix('jobs')->group(function () {
        Route::get('/', [JobsController::class, 'index'])->name('jobs.index');
        Route::get('/create-board', [JobsController::class, 'createJobBoard'])->name('jobs.createBoard');
        Route::post('/boards', [JobsController::class, 'storeJobBoard'])->name('jobs.storeBoard');
        Route::get('/boards/{id}', [JobsController::class, 'jobBoard'])->name('jobs.jobBoard');
        Route::get('/boards/{id}/edit', [JobsController::class, 'editJobBoard'])->name('jobs.editBoard');
        Route::put('/boards/{id}', [JobsController::class, 'updateJobBoard'])->name('jobs.updateBoard');
        Route::delete('/boards/{id}', [JobsController::class, 'destroyJobBoard'])->name('jobs.destroyBoard');
        
        // Applicants Routes (must be before /{id} routes to avoid conflicts)
        Route::get('/applicants', [JobsController::class, 'applicants'])->name('jobs.applicants');
        Route::get('/applicants/{id}', [JobsController::class, 'applicant'])->name('jobs.applicant');
        
        // Applications Routes (must be before /{id} routes to avoid conflicts)
        Route::get('/applications', [JobsController::class, 'applications'])->name('jobs.applications');
        Route::get('/applications/{id}', [JobsController::class, 'application'])->name('jobs.application');
        Route::put('/applications/{id}', [JobsController::class, 'updateApplication'])->name('jobs.updateApplication');
        Route::post('/applications/{id}/update-status', [JobsController::class, 'updateApplicationStatus'])->name('jobs.updateApplicationStatus');
        
        // Jobs Routes
        Route::get('/boards/{jobBoardId}/create-job', [JobsController::class, 'createJob'])->name('jobs.createJob');
        Route::post('/', [JobsController::class, 'storeJob'])->name('jobs.storeJob');
        Route::get('/{id}/edit', [JobsController::class, 'editJob'])->name('jobs.editJob');
        Route::put('/{id}', [JobsController::class, 'updateJob'])->name('jobs.updateJob');
        Route::delete('/{id}', [JobsController::class, 'destroyJob'])->name('jobs.destroyJob');
        Route::post('/{id}/publish', [JobsController::class, 'publishJob'])->name('jobs.publishJob');
        Route::post('/{id}/close', [JobsController::class, 'closeJob'])->name('jobs.closeJob');
    });
});
