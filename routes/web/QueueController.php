<?php

use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Queue Management Routes
|--------------------------------------------------------------------------
|
| Routes for queue management system including queue creation, management,
| and queue number handling.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Queue Management
    Route::prefix('queue')->group(function () {
        Route::get('/', [QueueController::class, 'index'])->name('queue.index');
        Route::get('/create', [QueueController::class, 'create'])->name('queue.create');
        Route::post('/', [QueueController::class, 'store'])->name('queue.store');
        Route::get('/{id}', [QueueController::class, 'show'])->name('queue.show');
        Route::get('/{id}/edit', [QueueController::class, 'edit'])->name('queue.edit');
        Route::put('/{id}', [QueueController::class, 'update'])->name('queue.update');
        Route::delete('/{id}', [QueueController::class, 'destroy'])->name('queue.destroy');
        
        // Queue Number Management
        Route::get('/numbers/list', [QueueController::class, 'getQueueNumbers'])->name('queue.numbers.list');
        Route::post('/numbers/create', [QueueController::class, 'createQueueNumber'])->name('queue.create-number');
        Route::post('/call-next', [QueueController::class, 'callNext'])->name('queue.call-next');
        Route::post('/{id}/start-serving', [QueueController::class, 'startServing'])->name('queue.start-serving');
        Route::post('/{id}/complete', [QueueController::class, 'complete'])->name('queue.complete');
        Route::post('/{id}/cancel', [QueueController::class, 'cancel'])->name('queue.cancel');
        Route::get('/status/overview', [QueueController::class, 'getStatus'])->name('queue.status');
    });
});
