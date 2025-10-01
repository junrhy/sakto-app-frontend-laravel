<?php

use App\Http\Controllers\PagesController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Pages Routes
|--------------------------------------------------------------------------
|
| Routes for page management including page creation, editing, and
| public page access.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Pages Creator
    Route::resource('pages', PagesController::class);
    Route::get('/pages/settings', [PagesController::class, 'settings'])->name('pages.settings');
    Route::get('/pages/list', [PagesController::class, 'getPages'])->name('pages.list');
    Route::get('/pages/{id}/duplicate', [PagesController::class, 'duplicate'])->name('pages.duplicate');
});
