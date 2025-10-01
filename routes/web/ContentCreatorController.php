<?php

use App\Http\Controllers\ContentCreatorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Content Creator Routes
|--------------------------------------------------------------------------
|
| Routes for content creation and management including content CRUD operations
| and content publishing.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Content Management (subscription required)
    Route::prefix('content-creator')->group(function () {
        Route::get('/', [ContentCreatorController::class, 'index'])->name('content-creator.index');
        Route::get('/create', [ContentCreatorController::class, 'create'])->name('content-creator.create');
        Route::post('/', [ContentCreatorController::class, 'store'])->name('content-creator.store');
        Route::get('/settings', [ContentCreatorController::class, 'settings'])->name('content-creator.settings');
        Route::get('/list', [ContentCreatorController::class, 'getContent'])->name('content-creator.list');
        
        // Parameter routes (must come after specific routes)
        Route::get('/{id}', [ContentCreatorController::class, 'show'])->name('content-creator.show');
        Route::get('/{id}/edit', [ContentCreatorController::class, 'edit'])->name('content-creator.edit');
        Route::put('/{id}', [ContentCreatorController::class, 'update'])->name('content-creator.update');
        Route::delete('/{id}', [ContentCreatorController::class, 'destroy'])->name('content-creator.destroy');
        Route::patch('/{id}/status', [ContentCreatorController::class, 'updateStatus'])->name('content-creator.update-status');
        Route::get('/{id}/preview', [ContentCreatorController::class, 'preview'])->name('content-creator.preview');
        
        Route::post('/bulk-delete', [ContentCreatorController::class, 'bulkDestroy'])->name('content-creator.bulk-destroy');
    });
});
