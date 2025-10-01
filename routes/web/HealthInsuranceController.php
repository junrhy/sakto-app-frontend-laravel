<?php

use App\Http\Controllers\HealthInsuranceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Health Insurance Routes
|--------------------------------------------------------------------------
|
| Routes for health insurance management including member management,
| contributions, claims, and reporting.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Health Insurance Routes
    Route::prefix('health-insurance')->group(function () {
        Route::get('/', [HealthInsuranceController::class, 'index'])->name('health-insurance');
        
        // Member routes
        Route::get('/members/{id}', [HealthInsuranceController::class, 'showMember'])->name('health-insurance.members.show');
        Route::post('/members', [HealthInsuranceController::class, 'storeMember'])->name('health-insurance.members.store');
        Route::put('/members/{id}', [HealthInsuranceController::class, 'updateMember'])->name('health-insurance.members.update');
        Route::delete('/members/{id}', [HealthInsuranceController::class, 'deleteMember'])->name('health-insurance.members.delete');
        
        // Contributions
        Route::post('/contributions/bulk', [HealthInsuranceController::class, 'recordBulkContributions'])->name('health-insurance.contributions.bulk');
        Route::post('/contributions/{memberId}', [HealthInsuranceController::class, 'recordContribution'])->name('health-insurance.contributions.store');
        Route::put('/contributions/{memberId}/{contributionId}', [HealthInsuranceController::class, 'updateContribution'])->name('health-insurance.contributions.update');
        Route::get('/contributions/{memberId}', [HealthInsuranceController::class, 'getMemberContributions'])->name('health-insurance.contributions.index');
        Route::delete('/contributions/{memberId}/{contributionId}', [HealthInsuranceController::class, 'deleteContribution'])->name('health-insurance.contributions.delete');
        
        // Claims
        Route::post('/claims/{memberId}', [HealthInsuranceController::class, 'submitClaim'])->name('health-insurance.claims.store');
        Route::put('/claims/{memberId}/{claimId}', [HealthInsuranceController::class, 'updateClaim'])->name('health-insurance.claims.update');
        Route::delete('/claims/{memberId}/{claimId}', [HealthInsuranceController::class, 'deleteClaim'])->name('health-insurance.claims.delete');
        Route::patch('/claims/{claimId}/status', [HealthInsuranceController::class, 'updateClaimStatus'])->name('health-insurance.claims.status');
        Route::get('/claims/{memberId}', [HealthInsuranceController::class, 'getMemberClaims'])->name('health-insurance.claims.member');
        Route::get('/contributions/{memberId}', [HealthInsuranceController::class, 'getMemberContributions'])->name('health-insurance.contributions.member');
        
        // Reports
        Route::post('/report', [HealthInsuranceController::class, 'generateReport'])->name('health-insurance.report');
    });
});
