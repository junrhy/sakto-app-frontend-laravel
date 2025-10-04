<?php

use App\Http\Controllers\TwilioAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Twilio Account Routes
|--------------------------------------------------------------------------
|
| Routes for Twilio account management functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/twilio-accounts', [TwilioAccountController::class, 'index'])->name('twilio-accounts.index');
    Route::post('/twilio-accounts', [TwilioAccountController::class, 'store'])->name('twilio-accounts.store');
    Route::put('/twilio-accounts/{twilioAccount}', [TwilioAccountController::class, 'update'])->name('twilio-accounts.update');
    Route::delete('/twilio-accounts/{twilioAccount}', [TwilioAccountController::class, 'destroy'])->name('twilio-accounts.destroy');
    Route::post('/twilio-accounts/{twilioAccount}/verify', [TwilioAccountController::class, 'verify'])->name('twilio-accounts.verify');
    Route::post('/twilio-accounts/{twilioAccount}/toggle-active', [TwilioAccountController::class, 'toggleActive'])->name('twilio-accounts.toggle-active');
});
