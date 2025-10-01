<?php

use App\Http\Controllers\CommunityKioskTerminalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Community Kiosk Terminal Routes
|--------------------------------------------------------------------------
|
| Routes for community kiosk terminal functionality including event
| check-ins, contributions, and member search.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Community Kiosk Terminal (subscription required)
    Route::prefix('kiosk/community')->name('kiosk.community.')->group(function () {
        Route::get('/', [CommunityKioskTerminalController::class, 'index'])->name('index');
        Route::get('/data', [CommunityKioskTerminalController::class, 'getUpdatedData'])->name('data');
        
        // Event check-in routes
        Route::get('/events/{eventId}/participants', [CommunityKioskTerminalController::class, 'getEventParticipants'])->name('events.participants');
        Route::post('/events/{eventId}/participants/{participantId}/check-in', [CommunityKioskTerminalController::class, 'checkInParticipant'])->name('events.check-in');
        
        // Health insurance contribution routes
        Route::post('/health-insurance/contributions', [CommunityKioskTerminalController::class, 'submitHealthInsuranceContributions'])->name('health-insurance.contributions');
        
        // Mortuary contribution routes
        Route::post('/mortuary/contributions', [CommunityKioskTerminalController::class, 'submitMortuaryContributions'])->name('mortuary.contributions');
        
        // Search routes
        Route::post('/search/members', [CommunityKioskTerminalController::class, 'searchMembers'])->name('search.members');
    });
});
