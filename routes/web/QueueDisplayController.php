<?php

use App\Http\Controllers\QueueDisplayController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Queue Display Routes
|--------------------------------------------------------------------------
|
| Routes for queue display functionality including public displays
| and status monitoring.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Queue Display
    Route::prefix('queue-display')->group(function () {
        Route::get('/', [QueueDisplayController::class, 'index'])->name('queue.display');
        Route::get('/status', [QueueDisplayController::class, 'status'])->name('queue.display.status');
    });
});

// Public queue display (no authentication required)
Route::get('/queue-display/public/{identifier}', [QueueDisplayController::class, 'publicDisplay'])->name('queue.display.public');
