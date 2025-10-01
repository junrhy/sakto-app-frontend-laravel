<?php

use App\Http\Controllers\MortuaryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mortuary Routes
|--------------------------------------------------------------------------
|
| Routes for mortuary management including member management,
| contributions, claims, and reporting.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Mortuary (subscription required)
    Route::prefix('mortuary')->group(function () {
        Route::get('/', [MortuaryController::class, 'index'])->name('mortuary');
        Route::get('/members/{id}', [MortuaryController::class, 'showMember'])->name('mortuary.members.show');
        Route::post('/members', [MortuaryController::class, 'storeMember'])->name('mortuary.members.store');
        Route::put('/members/{id}', [MortuaryController::class, 'updateMember'])->name('mortuary.members.update');
        Route::delete('/members/{id}', [MortuaryController::class, 'deleteMember'])->name('mortuary.members.destroy');
        
        // Contribution routes
        Route::post('/contributions/bulk', [MortuaryController::class, 'recordBulkContributions'])->name('mortuary.contributions.bulk');
        Route::post('/contributions/{memberId}', [MortuaryController::class, 'recordContribution'])->name('mortuary.contributions.store');
        Route::put('/contributions/{memberId}/{contributionId}', [MortuaryController::class, 'updateContribution'])->name('mortuary.contributions.update');
        Route::get('/contributions/{memberId}', [MortuaryController::class, 'getMemberContributions'])->name('mortuary.contributions.index');
        Route::delete('/contributions/{memberId}/{contributionId}', [MortuaryController::class, 'deleteContribution'])->name('mortuary.contributions.destroy');
        
        // Claim routes
        Route::post('/claims/{memberId}', [MortuaryController::class, 'submitClaim'])->name('mortuary.claims.store');
        Route::put('/claims/{memberId}/{claimId}', [MortuaryController::class, 'updateClaim'])->name('mortuary.claims.update');
        Route::patch('/claims/{claimId}/status', [MortuaryController::class, 'updateClaimStatus'])->name('mortuary.claims.status');
        Route::patch('/claims/{claimId}/active-status', [MortuaryController::class, 'toggleActiveStatus'])->name('mortuary.claims.active-status');
        Route::get('/claims/{memberId}', [MortuaryController::class, 'getMemberClaims'])->name('mortuary.claims.index');
        Route::delete('/claims/{memberId}/{claimId}', [MortuaryController::class, 'deleteClaim'])->name('mortuary.claims.destroy');
        
        // Report routes
        Route::post('/reports', [MortuaryController::class, 'generateReport'])->name('mortuary.reports.generate');
    });
});
