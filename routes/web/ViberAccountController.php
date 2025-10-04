<?php

use App\Http\Controllers\ViberAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Viber Account Routes
|--------------------------------------------------------------------------
|
| Routes for Viber account management functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/viber-accounts', [ViberAccountController::class, 'index'])->name('viber-accounts.index');
    Route::post('/viber-accounts', [ViberAccountController::class, 'store'])->name('viber-accounts.store');
    Route::put('/viber-accounts/{id}', [ViberAccountController::class, 'update'])->name('viber-accounts.update');
    Route::delete('/viber-accounts/{id}', [ViberAccountController::class, 'destroy'])->name('viber-accounts.destroy');
    Route::post('/viber-accounts/{id}/test', [ViberAccountController::class, 'test'])->name('viber-accounts.test');
});
