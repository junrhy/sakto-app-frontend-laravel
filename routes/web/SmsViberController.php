<?php

use App\Http\Controllers\SmsViberController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SMS Viber Routes
|--------------------------------------------------------------------------
|
| Routes for Viber messaging functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    Route::get('/sms-viber', [SmsViberController::class, 'index'])->name('viber-sms');
    Route::post('/sms-viber/send', [SmsViberController::class, 'sendMessage'])->name('viber-sms.send');
});
