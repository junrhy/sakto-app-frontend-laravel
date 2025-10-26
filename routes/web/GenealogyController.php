<?php

use App\Http\Controllers\GenealogyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Genealogy Routes
|--------------------------------------------------------------------------
|
| Routes for genealogy management including family member management,
| relationships, and genealogy visualization.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Genealogy (subscription required)
    Route::prefix('genealogy')->group(function () {
        Route::get('/', [GenealogyController::class, 'index'])->name('genealogy');
        Route::get('/settings', [GenealogyController::class, 'settings'])->name('genealogy.settings');
        Route::post('/settings', [GenealogyController::class, 'saveSettings'])->name('genealogy.settings.save');
        Route::get('/members', [GenealogyController::class, 'getFamilyMembers'])->name('genealogy.members');
        Route::get('/widget-stats', [GenealogyController::class, 'getWidgetStats'])->name('genealogy.widget-stats');
        Route::post('/members', [GenealogyController::class, 'store'])->name('genealogy.members.store');
        Route::put('/members/{id}', [GenealogyController::class, 'update'])->name('genealogy.members.update');
        Route::delete('/members/{id}', [GenealogyController::class, 'destroy'])->name('genealogy.members.destroy');
        Route::post('/relationships', [GenealogyController::class, 'addRelationship'])->name('genealogy.relationships.add');
        Route::delete('/relationships/{id}', [GenealogyController::class, 'removeRelationship'])->name('genealogy.relationships.remove');
        Route::get('/export', [GenealogyController::class, 'export'])->name('genealogy.export');
        Route::post('/import', [GenealogyController::class, 'import'])->name('genealogy.import');
        Route::get('/visualization', [GenealogyController::class, 'getVisualizationData'])->name('genealogy.visualization');
        Route::get('/edit-requests', [GenealogyController::class, 'editRequests'])->name('genealogy.edit-requests');
        Route::get('/edit-requests/data', [GenealogyController::class, 'getEditRequests'])->name('genealogy.edit-requests.data');
        Route::post('/edit-requests/{id}/accept', [GenealogyController::class, 'acceptEditRequest'])->name('genealogy.edit-requests.accept');
        Route::post('/edit-requests/{id}/reject', [GenealogyController::class, 'rejectEditRequest'])->name('genealogy.edit-requests.reject');
    });
});
