<?php

use App\Http\Controllers\TeamsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
|
| Routes for team management including team member management, team
| creation, and team settings.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Teams Management
    Route::prefix('teams')->group(function () {
        Route::get('/', [TeamsController::class, 'index'])->name('teams.index');
        Route::get('/create', [TeamsController::class, 'create'])->name('teams.create');
        Route::post('/', [TeamsController::class, 'store'])->name('teams.store');
        Route::get('/{identifier}', [TeamsController::class, 'show'])->name('teams.show');
        Route::get('/{identifier}/edit', [TeamsController::class, 'edit'])->name('teams.edit');
        Route::put('/{identifier}', [TeamsController::class, 'update'])->name('teams.update');
        Route::delete('/{identifier}', [TeamsController::class, 'destroy'])->name('teams.destroy');
        Route::get('/settings', [TeamsController::class, 'settings'])->name('teams.settings');
        Route::get('/list', [TeamsController::class, 'getTeamMembers'])->name('teams.list');
        Route::patch('/{identifier}/toggle-status', [TeamsController::class, 'toggleStatus'])->name('teams.toggle-status');
        Route::post('/{identifier}/reset-password', [TeamsController::class, 'resetPassword'])->name('teams.reset-password');
        Route::get('/password/update', [TeamsController::class, 'showPasswordUpdate'])->name('team-member.password');
        Route::post('/password/update', [TeamsController::class, 'updatePassword'])->name('team-member.password.update');
    });
});
