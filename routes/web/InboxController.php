<?php

use App\Http\Controllers\InboxController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Inbox Routes
|--------------------------------------------------------------------------
|
| Routes for inbox functionality including message management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Inbox
    Route::get('/inbox', [InboxController::class, 'index'])->name('inbox');
    Route::patch('/inbox/{id}/read', [InboxController::class, 'markAsRead'])->name('inbox.mark-as-read');
    Route::delete('/inbox/{id}', [InboxController::class, 'delete'])->name('inbox.delete');
});
