<?php

use App\Http\Controllers\ChallengeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Challenge Routes
|--------------------------------------------------------------------------
|
| Routes for challenge management including challenge creation, participant
| management, timer functionality, and leaderboards.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Challenges (subscription required)
    Route::prefix('challenges')->group(function () {
        Route::get('/', [ChallengeController::class, 'index'])->name('challenges');
        Route::get('/settings', [ChallengeController::class, 'settings'])->name('challenges.settings');
        Route::get('/list', [ChallengeController::class, 'getList'])->name('challenges.list');
        Route::get('/participants-list', [ChallengeController::class, 'getParticipantsList'])->name('challenges.participants-list');
        Route::post('/', [ChallengeController::class, 'store'])->name('challenges.store');
        Route::delete('/bulk', [ChallengeController::class, 'bulkDestroy'])->name('challenges.bulk-destroy');
        
        // Parameter routes (must come after specific routes)
        Route::put('/{id}', [ChallengeController::class, 'update'])->name('challenges.update');
        Route::delete('/{id}', [ChallengeController::class, 'destroy'])->name('challenges.destroy');
        
        // Social features
        Route::get('/{id}/participants', [ChallengeController::class, 'getParticipants'])->name('challenges.participants');
        Route::post('/{id}/participants', [ChallengeController::class, 'addParticipant'])->name('challenges.add-participant');
        Route::delete('/{id}/participants/{participantId}', [ChallengeController::class, 'removeParticipant'])->name('challenges.remove-participant');
        Route::post('/{id}/progress', [ChallengeController::class, 'updateProgress'])->name('challenges.progress');
        Route::patch('/{id}/participation', [ChallengeController::class, 'updateParticipationStatus'])->name('challenges.participation');
        Route::get('/{id}/leaderboard', [ChallengeController::class, 'getLeaderboard'])->name('challenges.leaderboard');
        Route::get('/{id}/statistics', [ChallengeController::class, 'getStatistics'])->name('challenges.statistics');
        
        // Timer routes
        Route::post('/{id}/timer/start', [ChallengeController::class, 'startTimer'])->name('challenges.timer.start');
        Route::post('/{id}/timer/stop', [ChallengeController::class, 'stopTimer'])->name('challenges.timer.stop');
        Route::post('/{id}/timer/pause', [ChallengeController::class, 'pauseTimer'])->name('challenges.timer.pause');
        Route::post('/{id}/timer/resume', [ChallengeController::class, 'resumeTimer'])->name('challenges.timer.resume');
        Route::post('/{id}/timer/reset', [ChallengeController::class, 'resetTimer'])->name('challenges.timer.reset');
        Route::get('/{id}/timer/{participantId}/status', [ChallengeController::class, 'getTimerStatus'])->name('challenges.timer.status');
    });
});
