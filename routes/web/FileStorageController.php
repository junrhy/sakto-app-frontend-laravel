<?php

use App\Http\Controllers\FileStorageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| File Storage Routes
|--------------------------------------------------------------------------
|
| Routes for file storage management including upload, download, and deletion.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::prefix('file-storage')->group(function () {
        Route::get('/', [FileStorageController::class, 'index'])->name('file-storage.index');
        Route::post('/', [FileStorageController::class, 'store'])->name('file-storage.store');
        Route::put('/{id}', [FileStorageController::class, 'update'])->name('file-storage.update');
        Route::delete('/{id}', [FileStorageController::class, 'destroy'])->name('file-storage.destroy');
        Route::get('/{id}/download', [FileStorageController::class, 'download'])->name('file-storage.download');
    });
});

